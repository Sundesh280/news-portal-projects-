-- ============================================================
-- setup.sql — Nepal Khabar Database Setup
-- ============================================================
-- Run this file once to create the database, all tables,
-- and seed initial data.
--
-- Security notes:
--  • All user passwords are stored as bcrypt hashes (never plain text).
--  • The admin seed below uses a pre-hashed password.
--    Replace the hash with your own via PHP:
--      echo password_hash('YourAdminPassword', PASSWORD_BCRYPT, ['cost' => 12]);
--  • VARCHAR(60) UUIDs use random_bytes() in PHP — unpredictable and unique.
-- ============================================================

CREATE DATABASE IF NOT EXISTS nepal_khabar
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE nepal_khabar;


-- ============================================================
-- TABLE: users
-- Stores registered user accounts (both regular users and admins).
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(60)  NOT NULL,
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(200) NOT NULL,
    password    VARCHAR(255) NOT NULL COMMENT 'bcrypt hash — never plain text',
    role        ENUM('user','admin') NOT NULL DEFAULT 'user',
    joined_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE  KEY uq_users_email (email),
    INDEX   idx_users_role    (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: articles
-- Stores bilingual (Nepali + English) news articles.
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
    id          VARCHAR(60)  NOT NULL,
    category    VARCHAR(50)  NOT NULL DEFAULT 'general',
    title       TEXT,
    title_en    TEXT,
    summary     TEXT,
    summary_en  TEXT,
    content     LONGTEXT,
    content_en  LONGTEXT,
    image       TEXT,
    author      VARCHAR(150),
    date        DATE,
    views       INT          NOT NULL DEFAULT 0,
    is_stopped  TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_articles_category   (category),
    INDEX idx_articles_date       (date),
    INDEX idx_articles_is_stopped (is_stopped)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: comments
-- User comments on articles. Cascades on article delete.
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
    id          VARCHAR(60)  NOT NULL,
    article_id  VARCHAR(60)  NOT NULL,
    user_id     VARCHAR(60)  NOT NULL,
    name        VARCHAR(150),
    text_body   TEXT,
    date        VARCHAR(100),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_comments_article (article_id),
    INDEX idx_comments_user    (user_id),
    CONSTRAINT fk_comments_article
        FOREIGN KEY (article_id) REFERENCES articles(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: subscribers
-- People who subscribed for news updates.
-- ============================================================
CREATE TABLE IF NOT EXISTS subscribers (
    id          VARCHAR(60)  NOT NULL,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(200) NOT NULL,
    phone       VARCHAR(30),
    location    VARCHAR(150),
    joined_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_subscribers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: submissions
-- Public news tips submitted by subscribers.
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
    id                   VARCHAR(60)  NOT NULL,
    subscriber_id        VARCHAR(60),
    subscriber_name      VARCHAR(200),
    subscriber_email     VARCHAR(200),
    subscriber_location  VARCHAR(150),
    title_en             TEXT,
    title_np             TEXT,
    location             VARCHAR(150),
    date                 DATE,
    category             VARCHAR(50)  NOT NULL DEFAULT 'general',
    summary_en           TEXT,
    summary_np           TEXT,
    body_en              LONGTEXT,
    body_np              LONGTEXT,
    source               TEXT,
    photo                LONGTEXT,
    status               ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    submitted_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_submissions_status       (status),
    INDEX idx_submissions_subscriber   (subscriber_id),
    INDEX idx_submissions_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: ticker_headlines
-- Breaking news ticker entries shown at the top of the site.
-- ============================================================
CREATE TABLE IF NOT EXISTS ticker_headlines (
    id          VARCHAR(60)  NOT NULL,
    text_body   TEXT         NOT NULL,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    all_stopped TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_ticker_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- SEED DATA — Ticker Headlines
-- ============================================================
INSERT IGNORE INTO ticker_headlines (id, text_body, is_active) VALUES
('th-001', 'Nepal cricket team defeats India by 7 wickets in Asia Cup Qualifier', 1),
('th-002', 'Nepal Rastra Bank cuts interest rate to 5.0% — industries welcome move', 1),
('th-003', '5.2 magnitude earthquake tremors felt in Kathmandu Valley, no casualties reported', 1),
('th-004', 'Nepal Telecom launches 5G service in Kathmandu Valley', 1),
('th-005', 'Dengue fever cases rising in Terai districts — Health Ministry issues alert', 1);


-- ============================================================
-- SEED DATA — Sample Articles
-- ============================================================
INSERT IGNORE INTO articles
    (id, category, title, title_en, summary, summary_en, content, content_en, image, author, date, views)
VALUES
('art-001', 'general',
 'नेपाल क्रिकेट टोलीले एसिया कप क्वालिफायरमा भारतलाई ७ विकेटले हरायो',
 'Nepal Cricket Team Defeats India by 7 Wickets in Asia Cup Qualifier',
 'नेपालको क्रिकेट टोलीले एसिया कप क्वालिफायरमा शानदार जित हासिल गर्‍यो।',
 'Nepal''s cricket team achieved a stunning 7-wicket victory over India in the Asia Cup Qualifier.',
 'नेपालको क्रिकेट टोलीले एसिया कप क्वालिफायरमा भारतलाई ७ विकेटले पराजित गरेको छ।',
 'Nepal''s cricket team has achieved a historic victory, defeating India by 7 wickets in the Asia Cup Qualifier. Captain Rohit Paudel led by example with a brilliant half-century.',
 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
 'Sports Desk', CURDATE(), 1240),

('art-002', 'business',
 'नेपाल राष्ट्र बैंकले ब्याजदर ५.०% मा घटायो',
 'Nepal Rastra Bank Cuts Interest Rate to 5.0%',
 'नेपाल राष्ट्र बैंकले नीतिगत ब्याजदर घटाउने निर्णय गरेको छ।',
 'Nepal Rastra Bank has reduced the policy interest rate to 5.0%, welcomed by industries.',
 'नेपाल राष्ट्र बैंकले मौद्रिक नीति समीक्षामार्फत नीतिगत ब्याजदर ५.०% मा घटाउने निर्णय गरेको छ।',
 'Nepal Rastra Bank has announced a reduction in the policy interest rate to 5.0 percent. Industry leaders have welcomed the move, stating it will help revive investment and boost employment.',
 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
 'Economic Desk', CURDATE(), 890),

('art-003', 'health',
 'तराई जिल्लामा डेंगी ज्वरोका बिरामी बढे',
 'Dengue Fever Cases Rising in Terai Districts',
 'तराईका जिल्लाहरूमा डेंगी ज्वरोका बिरामीको संख्या बढ्दो छ।',
 'Health Ministry has issued an alert as dengue fever cases surge in Terai districts.',
 'स्वास्थ्य मन्त्रालयले तराईका जिल्लाहरूमा डेंगी ज्वरोका बिरामीको संख्या बढेकोमा सतर्कता अपनाउन आग्रह गरेको छ।',
 'The Ministry of Health has issued a public health alert following a rise in dengue cases. Officials urge citizens to eliminate standing water and seek immediate medical attention if symptomatic.',
 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&q=80',
 'Health Desk', CURDATE(), 650),

('art-004', 'technology',
 'नेपाल टेलिकमले काठमाडौं उपत्यकामा ५जी सेवा सुरु गर्‍यो',
 'Nepal Telecom Launches 5G Service in Kathmandu Valley',
 'नेपाल टेलिकमले ऐतिहासिक रूपमा ५जी सेवाको सुरुआत गरेको छ।',
 'Nepal Telecom officially launched 5G services in the Kathmandu Valley.',
 'नेपाल टेलिकमले काठमाडौं उपत्यकामा ५जी सेवाको आधिकारिक सुरुआत गर्‍यो।',
 'Nepal Telecom has officially launched its 5G mobile service across the Kathmandu Valley. Subscribers with 5G-compatible devices can now enjoy download speeds up to 1 Gbps in covered areas.',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
 'Tech Desk', CURDATE(), 1100),

('art-005', 'sports',
 'एसियन गेम्समा नेपाली एथलेटिक्स टोलीले ४ पदक जित्यो',
 'Nepali Athletics Team Wins 4 Medals at Asian Games',
 'नेपाली एथलेट्सहरूले एसियन गेम्समा उल्लेखनीय प्रदर्शन गरे।',
 'The Nepali athletics team delivered a historic performance at the Asian Games, winning 4 medals.',
 'नेपाली एथलेट्सहरूले एसियन गेम्समा चार पदक जित्दै देशको गौरव बढाएका छन्।',
 'Nepal''s athletics contingent delivered their best-ever performance at the Asian Games, returning home with four medals including one gold, two silver, and one bronze.',
 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
 'Sports Desk', CURDATE(), 780),

('art-006', 'science',
 'नेपाली वैज्ञानिकले हिमालयको हिउँ पग्लिनेबारे महत्वपूर्ण अनुसन्धान प्रकाशित गरे',
 'Nepali Scientists Publish Key Findings on Himalayan Glacier Melt',
 'हिमालयको हिउँ पग्लिने दरमा आएको परिवर्तनबारे नेपाली वैज्ञानिकहरूको अनुसन्धान प्रकाशित भयो।',
 'A team of Nepali scientists has published groundbreaking research on Himalayan glacial melt.',
 'नेपाली वैज्ञानिकहरूको टोलीले हिमालयका हिमनदीहरू तीव्र गतिमा पग्लिरहेको बताएका छन्।',
 'Researchers from Tribhuvan University and ICIMOD published landmark findings revealing Himalayan glaciers are melting at nearly twice the rate recorded two decades ago.',
 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
 'Science Desk', CURDATE(), 520),

('art-007', 'entertainment',
 'नेपाली चलचित्र "प्रेमगाथा" ले अन्तर्राष्ट्रिय पुरस्कार जित्यो',
 'Nepali Film "Premgatha" Wins International Award',
 'नेपाली चलचित्र जगतले अन्तर्राष्ट्रिय मञ्चमा मान्यता पाएको छ।',
 'The Nepali film Premgatha has won the Best Foreign Film award at the Seoul International Film Festival.',
 'नेपाली चलचित्र "प्रेमगाथा" ले सियोल अन्तर्राष्ट्रिय चलचित्र महोत्सवमा सर्वश्रेष्ठ विदेशी चलचित्रको पुरस्कार जित्यो।',
 'The Nepali film "Premgatha" has won the prestigious Best Foreign Film award at the Seoul International Film Festival, marking a new chapter for Nepali cinema globally.',
 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
 'Entertainment Desk', CURDATE(), 430);


-- ============================================================
-- SEED DATA — Default Admin Account
-- ──────────────────────────────────
-- ⚠ IMPORTANT: Replace the password hash below before deploying!
--
-- To generate your own hash, run in PHP (CLI or a temp script):
--   php -r "echo password_hash('YourSecurePassword!', PASSWORD_BCRYPT, ['cost' => 12]);"
--
-- The hash below corresponds to the placeholder password:
--   Admin@Nepal2026!
-- Change it immediately after first login.
-- ============================================================
INSERT IGNORE INTO users (id, name, email, password, role) VALUES (
    'admin-nk-001',
    'Nepal Khabar Admin',
    'admin@nepalkhabar.com',
    -- bcrypt hash of 'Admin@Nepal2026!' (cost=12), generated by XAMPP PHP
    -- ⚠ Replace this with YOUR OWN generated hash before production deployment!
    -- To regenerate:  C:\xampp\php\php.exe -r "echo password_hash('YourPass', PASSWORD_BCRYPT, ['cost'=>12]);"
    '$2y$12$nuqC8o6bj2OFndlT4C2t2ehbFceXDg/Owc/w/P0uyk5AgzZG6wEAi',
    'admin'
);
