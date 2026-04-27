#!/usr/bin/env python3
from __future__ import annotations

import argparse
import ftplib
import os
from pathlib import Path, PurePosixPath


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_LOCAL_DIR = ROOT / "site"
DEFAULT_REMOTE_DIR = "/cttd-email/magazine"


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"'")
        if key and key not in os.environ:
            os.environ[key] = value


def load_env_files() -> None:
    for env_path in (ROOT / ".env.local", ROOT / ".env"):
        load_env_file(env_path)


def parse_bool(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "y", "on"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="site/ 매거진 정적 파일을 FTP 서버에 업로드합니다.")
    parser.add_argument("--local-dir", default=str(DEFAULT_LOCAL_DIR), help="업로드할 로컬 디렉터리")
    parser.add_argument("--remote-dir", default=os.getenv("FTP_REMOTE_DIR", DEFAULT_REMOTE_DIR), help="FTP 원격 디렉터리")
    parser.add_argument("--host", default=os.getenv("FTP_HOST"), help="FTP 호스트")
    parser.add_argument("--port", type=int, default=int(os.getenv("FTP_PORT", "21")), help="FTP 포트")
    parser.add_argument("--user", default=os.getenv("FTP_USER"), help="FTP 사용자")
    parser.add_argument("--password", default=os.getenv("FTP_PASSWORD"), help="FTP 비밀번호")
    parser.add_argument("--secure", action="store_true", default=parse_bool(os.getenv("FTP_SECURE")), help="FTP_TLS 사용")
    parser.add_argument("--delete", action="store_true", help="로컬에 없는 원격 파일을 삭제")
    return parser.parse_args()


def require_config(args: argparse.Namespace) -> None:
    missing = [
        name
        for name, value in {
            "FTP_HOST": args.host,
            "FTP_USER": args.user,
            "FTP_PASSWORD": args.password,
        }.items()
        if not value
    ]
    if missing:
        raise SystemExit(f"FTP 설정이 없습니다: {', '.join(missing)}")


def connect(args: argparse.Namespace) -> ftplib.FTP:
    ftp_class = ftplib.FTP_TLS if args.secure else ftplib.FTP
    ftp = ftp_class()
    ftp.connect(args.host, args.port, timeout=30)
    ftp.login(args.user, args.password)
    ftp.set_pasv(True)
    if isinstance(ftp, ftplib.FTP_TLS):
        ftp.prot_p()
    return ftp


def ensure_remote_dir(ftp: ftplib.FTP, remote_dir: str) -> str:
    clean_dir = "/" + str(PurePosixPath(remote_dir)).strip("/")
    ftp.cwd("/")
    current = ""
    for part in clean_dir.strip("/").split("/"):
        if not part:
            continue
        current += f"/{part}"
        try:
            ftp.cwd(current)
        except ftplib.error_perm:
            ftp.mkd(current)
            ftp.cwd(current)
    return clean_dir


def remote_parent(path: str) -> str:
    parent = str(PurePosixPath(path).parent)
    return "/" if parent == "." else parent


def upload_file(ftp: ftplib.FTP, local_path: Path, remote_path: str) -> None:
    ensure_remote_dir(ftp, remote_parent(remote_path))
    with local_path.open("rb") as handle:
        ftp.storbinary(f"STOR {remote_path}", handle)


def list_remote_files(ftp: ftplib.FTP, remote_dir: str) -> set[str]:
    files: set[str] = set()

    def walk(path: str) -> None:
        try:
            entries = list(ftp.mlsd(path))
        except (ftplib.error_perm, AttributeError):
            return

        for name, facts in entries:
            if name in {".", ".."}:
                continue
            child = f"{path.rstrip('/')}/{name}"
            if facts.get("type") == "dir":
                walk(child)
            else:
                files.add(child)

    walk(remote_dir)
    return files


def delete_stale_files(ftp: ftplib.FTP, remote_files: set[str], uploaded_files: set[str]) -> int:
    stale_files = sorted(remote_files - uploaded_files, reverse=True)
    deleted = 0
    for remote_file in stale_files:
        try:
            ftp.delete(remote_file)
            deleted += 1
        except ftplib.error_perm:
            pass
    return deleted


def main() -> None:
    load_env_files()
    args = parse_args()
    require_config(args)

    local_dir = Path(args.local_dir).expanduser().resolve()
    if not local_dir.exists():
        raise SystemExit(f"로컬 디렉터리가 없습니다: {local_dir}")

    local_files = sorted(path for path in local_dir.rglob("*") if path.is_file() and not path.name.startswith("."))
    if not local_files:
        raise SystemExit(f"업로드할 파일이 없습니다: {local_dir}")

    with connect(args) as ftp:
        remote_dir = ensure_remote_dir(ftp, args.remote_dir)
        remote_before = list_remote_files(ftp, remote_dir) if args.delete else set()
        uploaded_files: set[str] = set()

        for local_file in local_files:
            relative_path = local_file.relative_to(local_dir).as_posix()
            remote_path = f"{remote_dir.rstrip('/')}/{relative_path}"
            upload_file(ftp, local_file, remote_path)
            uploaded_files.add(remote_path)

        deleted_count = delete_stale_files(ftp, remote_before, uploaded_files) if args.delete else 0

    print(f"FTP 업로드 완료: {len(uploaded_files)}개 파일")
    print(f"원격 경로: {args.remote_dir}")
    if args.delete:
        print(f"삭제된 원격 파일: {deleted_count}개")


if __name__ == "__main__":
    main()
