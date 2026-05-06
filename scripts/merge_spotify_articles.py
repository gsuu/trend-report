"""One-shot: merge Spotify articles #09, #10, #11 into a single article (#09).

Replaces #09 with the merged content; removes #10 and #11.
"""

import io
import json
import re
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
MAGAZINE_JSON = ROOT / "public" / "data" / "magazine.json"
REPORT_MD = ROOT / "runs" / "2026-05-06" / "magazine" / "magazine-report.md"


def make_section(title, prose, items, css_class=None):
    if prose:
        blocks, items_html = [], []
        for kind, body in items:
            blocks.append({"kind": kind, "html": body})
            items_html.append(f"@@{kind}@@{body}")
        return {
            "title": title,
            "className": css_class or "article-section is-deep-dive",
            "prose": True,
            "blocks": blocks,
            "itemsHtml": items_html,
        }
    blocks = [{"kind": "list", "html": body} for _, body in items]
    items_html = [body for _, body in items]
    return {
        "title": title,
        "className": css_class or "article-section is-bullet-summary",
        "prose": False,
        "blocks": blocks,
        "itemsHtml": items_html,
    }


MERGED = {
    "number": "09",
    "platform": "Spotify",
    "areaKey": "service",
    "area": "Service",
    "categoryKey": "platform",
    "category": "platform",
    "sourceType": "release_note",
    "sourceTypeLabel": "공식 릴리즈",
    "publicationDate": "2026-05-06",
    "date": "2026-05-05",
    "route": "/articles/2026-05-06-09",
    "href": "/articles/2026-05-06-09",
    "articleUrl": "https://magazine.cttd.co.kr/articles/2026-05-06-09",
    "image": "https://storage.googleapis.com/pr-newsroom-wp/1/2026/04/Spotifyx20thCenturyFox_TheDevilWearsPrada2_CharacterPlaylist_Miranda.jpg",
    "imageCaption": "Spotify × 20th Century Studios — Devil Wears Prada 2 캐릭터 플레이리스트(Miranda) 표지",
    "tags": ["Spotify", "개인화", "페르소나 카드", "Verified by Spotify", "Devil Wears Prada 2", "ACL Music Fest"],
    "takeawayHtml": "Spotify가 한 주에 풀어낸 세 가지 개인화 패턴 — 인증 정의·캐릭터 분류 카드·페스티벌 페르소나",
    "deckHtml": "Spotify가 4월 30일·5월 1일·5월 5일 사흘 사이에 'Verified by Spotify' 인증 뱃지(AI 페르소나 제외 정책 포함), Devil Wears Prada 2 캐릭터 분류 플레이리스트, ACL Music Fest 페르소나 카드를 잇따라 풀었다. 청취 데이터를 '나에게 맞는 결과 카드'로 바꾸는 같은 결의 패턴이 한 주에 세 번 묶인 흐름이다.",
    "facts": [
        {"label": "발행날짜", "valueHtml": "2026-04-30 ~ 2026-05-05"},
        {"label": "태그", "valueHtml": "Spotify 개인화 페르소나 카드 Verified by Spotify Devil Wears Prada 2 ACL Music Fest"},
        {"label": "국가", "valueHtml": "GLOBAL"},
        {"label": "카테고리", "valueHtml": "platform"},
        {"label": "직무 태그", "valueHtml": "웹서비스기획 웹디자인"},
        {"label": "출처", "valueHtml": "Spotify Newsroom"},
    ],
    "sourceUrl": "https://newsroom.spotify.com/2026-04-30/verified-by-spotify-badge-artist-details/",
    "sourceTitle": "Spotify Newsroom",
    "referenceLinks": [
        {"label": "Devil Wears Prada 2", "url": "https://newsroom.spotify.com/2026-05-01/devil-wears-prada-2-personalized-playlist-experience/", "title": "Spotify × Devil Wears Prada 2 개인화 플레이리스트"},
        {"label": "ACL Music Fest", "url": "https://newsroom.spotify.com/2026-05-05/acl-festival-personalized-experience/", "title": "Spotify × ACL Music Fest 2026 페르소나 카드"},
    ],
    "id": "2026-05-06-09",
    "issueSlug": "2026-05-06",
    "articleSlug": "2026-05-06-09",
}


MERGED["sections"] = [
    make_section(
        "서비스 변화 요약",
        prose=False,
        items=[
            ("list", "업데이트: Spotify가 사흘 사이에 개인화 패턴 셋을 풀었다 — (1) 4/30 'Verified by Spotify' 인증 뱃지와 아티스트 활동 상세 베타, (2) 5/1 'Devil Wears Prada 2' 캐릭터 분류 플레이리스트(Miranda·Andy·Nigel·Emily), (3) 5/5 ACL Music Fest 2026 페르소나 카드(The Seeker·The Crowd Favorite·The Wristband Veteran)."),
            ("list", "서비스 맥락: 자동 생성 음원과 AI 페르소나 계정이 늘어 검색 결과에서 '진짜 활동 중인 아티스트'를 가려낼 시그널이 필요해진 시점이다. 동시에 IP 협업 플레이리스트와 페스티벌 라인업 같은 마케팅 채널을 단발 콘텐츠가 아니라 '청취 데이터로 만들어지는 결과 카드'로 묶어 재진입 고리를 만들고 있다."),
            ("list", "변경 전: 검색 결과·프로필에는 팔로워/월간 청취자 수 정도만 보였고, 영화 OST 플레이리스트는 모든 사용자에게 같은 표지·같은 순서, 페스티벌 라인업은 공식 큐레이션 한 장으로 끝났다."),
            ("list", "변경 후: (1) 검색·프로필 양쪽에 'Verified by Spotify' 뱃지가 노출되고 About 영역에 발매·투어·커리어 흐름이 묶인다. (2) Devil Wears Prada 2 플레이리스트는 청취 습관 → 캐릭터 매칭으로 표지 이미지가 사람마다 다르게 바뀐다. (3) ACL 페르소나는 spotify.link/aclmusicfest 진입 시 페르소나 한 장 + 라인업 중 좋아하는 아티스트와 추천 신규를 짝지은 개인화 플레이리스트 + SNS 소셜 카드를 한 화면에서 제공한다."),
            ("list", "수치·팩트: Verified 뱃지는 출시 시점 활발 검색 아티스트의 99% 이상이 인증 상태로 시작 — 'AI가 만든 음원·AI 페르소나는 베타 동안 인증 대상에서 제외'를 본문에 명시. Devil Wears Prada 2는 캐릭터 4종(Miranda·Andy·Nigel·Emily) + 신곡 'RUNWAY'(Lady Gaga, Doechii) 포함, 20th Century Studios 협업. ACL은 페르소나 3종 + 진입 경로 spotify.link/aclmusicfest, 라인업에 Charli xcx·RÜFÜS DU SOL·Twenty One Pilots·Lorde·Skrillex 포함."),
        ],
    ),
    make_section(
        "인사이트",
        prose=True,
        items=[
            ("quote", "사흘 사이 같은 결의 패턴이 세 번 — 청취 데이터를 '결과 카드'로 바꿔서 검색 신뢰·IP 협업·페스티벌 마케팅을 동시에 다시 짠 주."),
            ("subhead", "왜 지금 이 업데이트인가"),
            ("paragraph", "Spotify가 4/30~5/5 사흘 사이에 풀어놓은 세 건은 형태가 달라 보이지만 같은 결을 따른다. 청취 활동 데이터를 입력으로, 결과를 '뱃지·표지·페르소나 카드' 같은 시각 신호로 떨어뜨리는 패턴이다. Verified by Spotify는 검색·프로필 첫 화면의 신뢰를 다시 정의하고, Devil Wears Prada 2 플레이리스트는 OST 한 장을 사람마다 다른 결과 카드로 만들고, ACL 페르소나는 라인업 발표일에 맞춰 '내가 챙겨볼 무대'를 한 장으로 답해준다. '뱃지를 누구에게 줄지'보다 '누구를 빼는지'에서 인증 정의를 좁힌 결정, IP 협업을 표지가 결과값이 되는 구조로 옮긴 결정, 페스티벌 콘텐츠를 공유 카드와 묶어 재유입 채널로 만든 결정이 한 주에 모인다."),
            ("subhead", "사용자는 무엇을 덜 해도 될까"),
            ("list", "검색 결과에서 비슷한 이름의 계정을 외부 SNS·뉴스로 다시 확인하던 단계 — 'Verified by Spotify' 뱃지가 그 자리를 대신한다."),
            ("list", "라인업 포스터와 자기 라이브러리를 직접 대조하며 '내가 아는 아티스트'를 추리는 작업 — 페르소나 카드 한 장이 추천 플레이리스트와 함께 그 결과를 던진다."),
            ("list", "캐릭터 진단을 위한 별도 퀴즈·설문 답변 — Devil Wears Prada 2는 진단 페이지 없이 청취 습관 데이터로 곧장 결과 표지를 바꾼다."),
            ("list", "결과를 SNS에 공유할 때 따로 이미지를 만드는 작업 — ACL은 결과 화면에 소셜 카드를 함께 붙여, 결과 화면 = 공유 카드 = 재유입 채널이 한 자리에서 묶이게 한다."),
            ("subhead", "설계 관점"),
            ("paragraph", "Verified 쪽은 검색 결과 카드와 상세 프로필 헤더 두 화면에 같은 뱃지를 같은 형태로 노출한 점이 핵심이다. 진입점마다 인증 표기 규칙이 달라지면 신뢰 장치가 오히려 흐려진다. 인증 조건은 단발 스파이크가 아니라 '일정 기간 이어진' 활동을 본다는 점, 온·오프라인 시그널을 함께 본다는 점에서 운영자 검수 기준이 시간 축으로 잡혔다. 그리고 가장 무거운 결정은 'AI 페르소나는 베타 동안 제외'라는 한 문장 — 인증 뱃지를 단순 본인 확인용에서 '활동 주체의 성격을 가르는 장치'로 옮긴다."),
            ("paragraph", "Devil Wears Prada 2 쪽은 진단 결과를 별도 페이지가 아니라 콘텐츠 표지에 얹은 구조다. '기획전 진입 → 진단 페이지 → 결과 페이지' 3단을 '기획전 진입 = 결과 페이지'로 줄이는 선택이고, 단 결과 근거(어떤 청취·구매·찜 데이터로 이 캐릭터가 됐는지)는 별도 영역에 풀어 줘야 신뢰 비용이 안 들어간다. 캐릭터 수를 4종으로 끝낸 것도 의도된 결정 — 너무 잘게 쪼개면 공유 가치가 떨어지고 너무 적으면 개인화로 읽히지 않는다."),
            ("paragraph", "ACL 쪽은 추천 결과를 '플레이리스트 한 줄'로 던지지 않고 페르소나 이름으로 한 번 감싼다. The Seeker·The Crowd Favorite·The Wristband Veteran처럼 사용자 행동 유형을 캐릭터 라벨로 압축해, 추천 근거가 '왜 나에게 이 곡인가'로 읽힌다. 추천 플레이리스트도 두 축으로 묶어 '라인업 중 내가 이미 듣는 아티스트'와 '취향상 좋아할 만한 신규'를 한 줄에 함께 배치 — 친숙함과 발견을 같은 큐레이션 안에 둔다. 진입 경로도 앱 내부 노출과 spotify.link 딥링크 두 갈래로 열어, 라인업 포스터·SNS·이메일 어디에서 들어오든 같은 결과 화면으로 모이게 했다."),
            ("subhead", "실무에 어떻게 적용할 수 있을까"),
            ("list", "셀러·브랜드 인증 뱃지를 도입한다면 '뱃지를 줄 조건'만 정하지 말고 '뱃지를 주지 않을 조건'을 같은 강도로 적어둔다. 자동 생성 상품 설명·자동 등록 셀러·대량 복제 콘텐츠가 서비스의 'AI 페르소나' 자리다."),
            ("list", "기프트 가이드·시즌 기획전을 캐릭터형 개인화로 옮긴다면 결과 카드 종 수를 결정의 핵심 변수로 둔다 — Spotify 사례에선 영화 캐릭터 4종, 페스티벌 페르소나 3종이 기준선."),
            ("list", "결과 화면을 공유 자산으로 보고 SNS 카드 + '내 결과 보러 가기' 역방향 진입을 같이 붙이면 단발 캠페인이 재방문으로 회수된다. 효과 검증 KPI도 클릭률만이 아니라 공유 카드 → 사이트 재유입까지 묶어 본다."),
            ("list", "추천 캐러셀은 '재구매 후보'와 '신규 발견 후보'를 한 카드 안에서 분리해 보여주고 있나 — Spotify 페르소나 플레이리스트의 두 축 구조를 그대로 점검 항목으로 가져올 수 있다."),
            ("subhead", "점검 질문"),
            ("paragraph", "검색 결과·상세 페이지에 셀러나 브랜드 인증 뱃지를 도입한다면, '뱃지를 줄 조건'과 '뱃지를 주지 않을 조건'을 같은 강도로 쓸 수 있는가? 서비스의 구매·찜·리뷰 이력을 묶어 '쇼퍼 페르소나' 한 장(예: 새 시즌 선도형, 가성비 점검형, 단골 보충형)을 만든다면 그 카드는 어느 진입(홈 / 마이페이지 / 기획전 배너)에 두어야 클릭이 살아날까? 캐릭터 분류 근거(청취 이력 → 캐릭터 매칭) 자리에 어떤 데이터(구매 이력·찜·검색)를 묶어야 사용자가 '내 데이터로 만들어진 결과'라고 신뢰할 수 있나?"),
        ],
    ),
]


def remove_from_markdown(numbers: list[str]):
    if not REPORT_MD.exists():
        return
    text = REPORT_MD.read_text(encoding="utf-8")
    for n in numbers:
        pattern = re.compile(rf"(?ms)^####\s+{re.escape(str(int(n)))}\.\s.*?(?=^####\s+\d+\.|^##\s|\Z)")
        text = pattern.sub("", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    REPORT_MD.write_text(text, encoding="utf-8")


def main():
    data = json.loads(MAGAZINE_JSON.read_text(encoding="utf-8"))
    issues = data["report"]["issues"]
    new_issues = []
    replaced = False
    for issue in issues:
        if issue.get("issueSlug") != "2026-05-06":
            new_issues.append(issue)
            continue
        n = str(issue.get("number"))
        if n == "09":
            new_issues.append(MERGED)
            replaced = True
            continue
        if n in ("10", "11"):
            continue
        new_issues.append(issue)
    if not replaced:
        # Fallback: append at the end of this week
        new_issues.append(MERGED)
    data["report"]["issues"] = new_issues
    MAGAZINE_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    remove_from_markdown(["10", "11"])
    print("merged Spotify articles into #09; removed #10, #11")


if __name__ == "__main__":
    main()
