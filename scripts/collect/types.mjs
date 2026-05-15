// 데이터 타입 (JSDoc 주석 — Vue 프로젝트에 TS 도입 부담 없이 IDE 추론용)

/**
 * @typedef {Object} Source
 * @property {string} id
 * @property {string} name
 * @property {'design'|'service'|'dev'} category
 * @property {string} rss
 * @property {'official'|'reference'|'newsletter'} sourceRole
 * @property {'KR'|'global'} locale
 * @property {string[]} [excludePatterns]
 */

/**
 * @typedef {Object} RawCandidate
 * @property {string} id            // sourceId-pubdate-hash
 * @property {string} title
 * @property {string} link
 * @property {string} pubDate
 * @property {string} contentSnippet
 * @property {string} image
 * @property {string} sourceId
 * @property {string} sourceName
 * @property {'design'|'service'|'dev'} sourceCategory
 * @property {string} locale
 */

/**
 * @typedef {Object} FilterVerdict
 * @property {string} id
 * @property {number} relevance       // 0~10
 * @property {'design'|'service'|'dev'} category
 * @property {string[]} tags
 * @property {string} reason          // 1줄 (디버그)
 */

/**
 * @typedef {Object} EnrichedArticle
 * @property {string} id
 * @property {string} title
 * @property {string} link
 * @property {string} pubDate
 * @property {string} sourceId
 * @property {string} sourceName
 * @property {'design'|'service'|'dev'} category
 * @property {string} locale
 * @property {number} relevance
 * @property {string[]} tags
 * @property {string} ogTitle
 * @property {string} ogDescription
 * @property {string} ogImage
 * @property {string} fullText        // metascraper로 추출한 본문
 */

/**
 * @typedef {Object} EditorialBlock
 * @property {'list'|'paragraph'|'callout'} kind
 * @property {string} html
 */

/**
 * @typedef {Object} EditorialSection
 * @property {string} title
 * @property {string} className
 * @property {boolean} prose
 * @property {EditorialBlock[]} blocks
 */

/**
 * @typedef {Object} ReferenceLink
 * @property {string} label
 * @property {string} title
 * @property {string} url
 */

/**
 * @typedef {Object} Issue
 * @property {string} id
 * @property {string} number
 * @property {string} platform
 * @property {string} areaKey
 * @property {string} area
 * @property {string} categoryKey
 * @property {string} category
 * @property {string} date
 * @property {string} route
 * @property {string} image
 * @property {string} imageCaption
 * @property {string[]} tags
 * @property {string} takeawayHtml
 * @property {string} deckHtml
 * @property {string} sourceUrl
 * @property {string} sourceTitle
 * @property {ReferenceLink[]} referenceLinks
 * @property {EditorialSection[]} sections
 */

/**
 * @typedef {Object} WeeklyReport
 * @property {string} slug
 * @property {string} title
 * @property {string} description
 * @property {string} weekLabel
 * @property {string} publishedAt
 * @property {Issue[]} issues
 */

/**
 * @typedef {Object} ManifestEntry
 * @property {string} slug
 * @property {string} weekLabel
 * @property {string} publishedAt
 * @property {number} issueCount
 */

/**
 * @typedef {Object} Manifest
 * @property {string} generatedAt
 * @property {ManifestEntry[]} weeks
 */

export {};
