-- ============================================================
--  Nepal Khabar — Database Setup
--  Run this ONCE in phpMyAdmin > Import
-- ============================================================

CREATE DATABASE IF NOT EXISTS nepal_khabar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nepal_khabar;

-- ── Articles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
    id           VARCHAR(50)  PRIMARY KEY,
    category     VARCHAR(50)  NOT NULL DEFAULT 'general',
    title        TEXT,
    title_en     TEXT,
    summary      TEXT,
    summary_en   TEXT,
    content      LONGTEXT,
    content_en   LONGTEXT,
    image        TEXT,
    author       VARCHAR(150),
    date         DATE,
    views        INT          DEFAULT 0,
    is_stopped   TINYINT(1)   DEFAULT 0,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         VARCHAR(50)  PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    email      VARCHAR(200) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  DEFAULT 'user',
    joined_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (id, name, email, password, role)
VALUES ('user-admin', 'Admin', 'admin@nepalkhabar.com', 'admin123', 'admin');

-- ── Comments ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id         VARCHAR(50)  PRIMARY KEY,
    article_id VARCHAR(50)  NOT NULL,
    user_id    VARCHAR(50)  NOT NULL,
    name       VARCHAR(150),
    text_body  TEXT,
    date       VARCHAR(100),
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- ── Subscribers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscribers (
    id         VARCHAR(50)  PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(200) NOT NULL UNIQUE,
    phone      VARCHAR(30),
    location   VARCHAR(150),
    joined_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Submissions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
    id                   VARCHAR(60)  PRIMARY KEY,
    subscriber_id        VARCHAR(50),
    subscriber_name      VARCHAR(200),
    subscriber_email     VARCHAR(200),
    subscriber_location  VARCHAR(150),
    title_en             TEXT,
    title_np             TEXT,
    location             VARCHAR(150),
    date                 DATE,
    category             VARCHAR(50)  DEFAULT 'general',
    summary_en           TEXT,
    summary_np           TEXT,
    body_en              LONGTEXT,
    body_np              LONGTEXT,
    source               TEXT,
    photo                LONGTEXT,
    status               VARCHAR(20)  DEFAULT 'pending',
    submitted_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Ticker Headlines ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticker_headlines (
    id          VARCHAR(50)  PRIMARY KEY,
    text_body   TEXT         NOT NULL,
    is_active   TINYINT(1)   DEFAULT 1,
    all_stopped TINYINT(1)   DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Seed: Default Ticker Headlines ───────────────────────────
INSERT IGNORE INTO ticker_headlines (id, text_body, is_active) VALUES
('th-default-1', 'Nepal cricket team defeats India by 7 wickets in Asia Cup Qualifier', 1),
('th-default-2', 'Nepal Rastra Bank cuts interest rate to 5.0% — industries welcome move', 1),
('th-default-3', '5.2 magnitude earthquake tremors felt in Kathmandu Valley, no casualties reported', 1),
('th-default-4', 'Nepal Telecom launches 5G service in Kathmandu Valley', 1),
('th-default-5', 'Dengue fever cases rising in Terai districts — Health Ministry issues alert', 1);

-- ── Seed: Sample Articles ─────────────────────────────────────
INSERT IGNORE INTO articles (id, category, title, title_en, summary, summary_en, content, content_en, image, author, date, views) VALUES
('art-001', 'general',
 'नेपाल क्रिकेट टोलीले एसिया कप क्वालिफायरमा भारतलाई ७ विकेटले हरायो',
 'Nepal Cricket Team Defeats India by 7 Wickets in Asia Cup Qualifier',
 'नेपालको क्रिकेट टोलीले एसिया कप क्वालिफायरमा शानदार जित हासिल गर्‍यो।',
 'Nepal''s cricket team achieved a stunning 7-wicket victory over India in the Asia Cup Qualifier, marking a historic milestone.',
 'नेपालको क्रिकेट टोलीले एसिया कप क्वालिफायरमा भारतलाई ७ विकेटले पराजित गरेको छ। यो नेपाली क्रिकेटको इतिहासमा एउटा महत्वपूर्ण उपलब्धि हो।',
 'Nepal''s cricket team has achieved a historic victory, defeating India by 7 wickets in the Asia Cup Qualifier. This remarkable win marks a turning point for Nepali cricket on the international stage. The team chased down India''s total with ease, showcasing exceptional batting performances. Captain Rohit Paudel led by example with a brilliant half-century.',
 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
 'Sports Desk', CURDATE(), 1240),

('art-002', 'business',
 'नेपाल राष्ट्र बैंकले ब्याजदर ५.०% मा घटायो',
 'Nepal Rastra Bank Cuts Interest Rate to 5.0%',
 'नेपाल राष्ट्र बैंकले नीतिगत ब्याजदर घटाउने निर्णय गरेको छ।',
 'Nepal Rastra Bank has reduced the policy interest rate to 5.0%, a move welcomed by industries and businesses across the country.',
 'नेपाल राष्ट्र बैंकले मौद्रिक नीति समीक्षामार्फत नीतिगत ब्याजदर ५.०% मा घटाउने निर्णय गरेको छ।',
 'Nepal Rastra Bank has announced a reduction in the policy interest rate to 5.0 percent in its latest monetary policy review. This decision is expected to stimulate economic growth by making credit more accessible to businesses and individuals. Industry leaders have welcomed the move, stating it will help revive investment and boost employment.',
 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
 'Economic Desk', CURDATE(), 890),

('art-003', 'health',
 'तराई जिल्लामा डेंगी ज्वरोका बिरामी बढे',
 'Dengue Fever Cases Rising in Terai Districts',
 'तराईका जिल्लाहरूमा डेंगी ज्वरोका बिरामीको संख्या बढ्दो छ।',
 'Health Ministry has issued an alert as dengue fever cases surge in Terai districts. Citizens are urged to take preventive measures.',
 'स्वास्थ्य मन्त्रालयले तराईका जिल्लाहरूमा डेंगी ज्वरोका बिरामीको संख्या बढेकोमा सतर्कता अपनाउन आग्रह गरेको छ।',
 'The Ministry of Health and Population has issued a public health alert following a significant rise in dengue fever cases across Terai districts. Officials urge citizens to eliminate standing water, use mosquito repellent, and seek immediate medical attention if experiencing symptoms including high fever, severe headache, and muscle pain.',
 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&q=80',
 'Health Desk', CURDATE(), 650),

('art-004', 'technology',
 'नेपाल टेलिकमले काठमाडौं उपत्यकामा ५जी सेवा सुरु गर्‍यो',
 'Nepal Telecom Launches 5G Service in Kathmandu Valley',
 'नेपाल टेलिकमले ऐतिहासिक रूपमा ५जी सेवाको सुरुआत गरेको छ।',
 'Nepal Telecom officially launched 5G services in the Kathmandu Valley, making Nepal one of the first South Asian countries to roll out next-generation connectivity.',
 'नेपाल टेलिकमले काठमाडौं उपत्यकामा ५जी सेवाको आधिकारिक सुरुआत गर्‍यो।',
 'Nepal Telecom has officially launched its 5G mobile service across the Kathmandu Valley, marking a historic milestone in the country''s telecommunications sector. The launch makes Nepal one of the first nations in South Asia to roll out next-generation connectivity. Subscribers with 5G-compatible devices can now enjoy download speeds up to 1 Gbps in covered areas.',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
 'Tech Desk', CURDATE(), 1100),

('art-005', 'sports',
 'एसियन गेम्समा नेपाली एथलेटिक्स टोलीले ४ पदक जित्यो',
 'Nepali Athletics Team Wins 4 Medals at Asian Games',
 'नेपाली एथलेट्सहरूले एसियन गेम्समा उल्लेखनीय प्रदर्शन गरे।',
 'The Nepali athletics team delivered a historic performance at the Asian Games, winning 4 medals including one gold.',
 'नेपाली एथलेट्सहरूले एसियन गेम्समा चार पदक जित्दै देशको गौरव बढाएका छन्।',
 'Nepal''s athletics contingent delivered their best-ever performance at the Asian Games, returning home with four medals. The haul includes one gold, two silver, and one bronze medal across track and field events. This achievement represents a significant step forward for Nepali athletics on the continental stage.',
 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
 'Sports Desk', CURDATE(), 780),

('art-006', 'science',
 'नेपाली वैज्ञानिकले हिमालयको हिउँ पग्लिनेबारे महत्वपूर्ण अनुसन्धान प्रकाशित गरे',
 'Nepali Scientists Publish Key Findings on Himalayan Glacier Melt',
 'हिमालयको हिउँ पग्लिने दरमा आएको परिवर्तनबारे नेपाली वैज्ञानिकहरूको अनुसन्धान अन्तर्राष्ट्रिय जर्नलमा प्रकाशित भयो।',
 'A team of Nepali scientists has published groundbreaking research on the accelerating rate of glacial melt in the Himalayas, warning of serious downstream consequences.',
 'नेपाली वैज्ञानिकहरूको टोलीले हिमालयका हिमनदीहरू तीव्र गतिमा पग्लिरहेको बताएका छन्।',
 'A team of researchers from Tribhuvan University and the International Centre for Integrated Mountain Development (ICIMOD) has published landmark findings on the rate of glacial melt in the Himalayas. Published in the journal Nature Climate Change, the study reveals that Himalayan glaciers are melting at nearly twice the rate recorded two decades ago, posing serious risks to freshwater availability for millions downstream.',
 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
 'Science Desk', CURDATE(), 520),

('art-007', 'entertainment',
 'नेपाली चलचित्र "प्रेमगाथा" ले अन्तर्राष्ट्रिय पुरस्कार जित्यो',
 'Nepali Film "Premgatha" Wins International Award',
 'नेपाली चलचित्र जगतले अन्तर्राष्ट्रिय मञ्चमा मान्यता पाएको छ।',
 'The Nepali film Premgatha has won the Best Foreign Film award at the Seoul International Film Festival, bringing international recognition to Nepali cinema.',
 'नेपाली चलचित्र "प्रेमगाथा" ले सियोल अन्तर्राष्ट्रिय चलचित्र महोत्सवमा सर्वश्रेष्ठ विदेशी चलचित्रको पुरस्कार जित्यो।',
 'The Nepali film "Premgatha" has won the prestigious Best Foreign Film award at the Seoul International Film Festival. Director Manish Shrestha accepted the award on behalf of the cast and crew, dedicating it to Nepali cinema''s growing global presence. The film, which explores themes of love and tradition in rural Nepal, has already won awards at three other international festivals.',
 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
 'Entertainment Desk', CURDATE(), 430);
