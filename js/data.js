/* ============================================================
   data.js — Central data store for Nepal Khabar
   Only articles and admin data persist in localStorage.
   User data, comments, subscribers, and submissions are not saved.
   ============================================================ */

const DB = {
  KEYS: {
    articles    : 'nk__articles',
    users       : 'nk__users',
    comments    : 'nk__comments',
    session     : 'nk__session',
    subscribers : 'nk__subscribers',
    submissions : 'nk__submissions',
  },

  /* ── Articles ─────────────────────────────────── */
  getArticles() {
    const raw = localStorage.getItem(this.KEYS.articles);
    if (raw) return JSON.parse(raw);
    /* Seed with default Nepal news articles */
    const defaults = [
      {
        id: 'art-1',
        category: 'general',
        title: 'काठमाडौंमा ठूलो भूकम्पको झड्का, कुनै क्षति नभएको अधिकारीहरूले बताए',
        titleEn: 'Strong Earthquake Tremors in Kathmandu, Officials Report No Damage',
        summary: 'काठमाडौं उपत्यकामा रिक्टर स्केलमा ५.२ म्याग्निच्युडको भूकम्प गयो। राष्ट्रिय भूकम्प मापन केन्द्रका अनुसार भूकम्पको केन्द्रविन्दु सिन्धुपाल्चोकमा थियो।',
        summaryEn: 'A 5.2 magnitude earthquake struck the Kathmandu Valley. According to the National Seismological Centre, the epicenter was in Sindhupalchok district.',
        content: 'काठमाडौं, चैत्र १७ — काठमाडौं उपत्यकामा आज बिहान ७ बजेर ३५ मिनेटमा रिक्टर स्केलमा ५.२ म्याग्निच्युडको भूकम्पको धक्का महसुस गरियो। राष्ट्रिय भूकम्प मापन केन्द्रका अनुसार भूकम्पको केन्द्रविन्दु सिन्धुपाल्चोक जिल्लामा थियो र गहिराइ १० किलोमिटर मात्र थियो। भूकम्पका कारण काठमाडौं, ललितपुर र भक्तपुर जिल्लामा व्यापक त्रास फैलियो। धेरैजसो मानिसहरू घरबाट बाहिर निस्किए। तथापि अहिलेसम्म कुनै जनधनको क्षति भएको खबर आएको छैन। गृह मन्त्रालयले सबै जिल्लामा अवस्थाको जानकारी लिइरहेको बताएको छ।\n\nनेपाल प्रहरी र सशस्त्र प्रहरीलाई सतर्क अवस्थामा राखिएको छ। राष्ट्रिय भूकम्प मापन केन्द्रका प्रमुख डा. लोकविजय अधिकारीले भने, "यो भूकम्पको परकम्प आउन सक्छ, नागरिकहरूले सतर्क रहनुस्।" विशेषज्ञहरूले यस क्षेत्रमा नियमित भूकम्पीय गतिविधि हुने भएकाले बासिन्दाहरूले तयारीमा ध्यान दिन आग्रह गरेका छन्।',
        contentEn: 'KATHMANDU, March 17 — A 5.2 magnitude earthquake shook the Kathmandu Valley at 7:35 AM today. According to the National Seismological Centre, the epicenter was in Sindhupalchok district at a shallow depth of just 10 kilometers. The tremors caused widespread panic in Kathmandu, Lalitpur, and Bhaktapur districts, with many residents rushing out of buildings. No casualties or property damage have been reported so far. The Ministry of Home Affairs said it is monitoring the situation across all districts.\n\nThe Nepal Police and Armed Police Force have been placed on alert. Dr. Lokbijay Adhikari, chief of the National Seismological Centre, said, "Aftershocks are possible — citizens should remain vigilant." Experts urged residents in the region to be prepared, as seismic activity is common in this area.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        author: 'Ramesh Sharma',
        date: '2026-03-31',
        views: 1240,
      },
      {
        id: 'art-2',
        category: 'business',
        title: 'नेपाल राष्ट्र बैंकले ब्याजदर घटायो, उद्योगीहरू खुसी',
        titleEn: 'Nepal Rastra Bank Cuts Interest Rate, Industrialists Pleased',
        summary: 'नेपाल राष्ट्र बैंकले नीतिगत ब्याजदर ०.५ प्रतिशत बिन्दुले घटाउने निर्णय गरेको छ। यस निर्णयले निजी क्षेत्रको लगानी बढाउन मद्दत गर्नेछ।',
        summaryEn: 'Nepal Rastra Bank has decided to cut the policy interest rate by 0.5 percentage points, a move welcomed by the private sector as a boost to investment.',
        content: 'काठमाडौं — नेपाल राष्ट्र बैंकले आज आफ्नो मौद्रिक नीतिको मध्यावधि समीक्षामा नीतिगत ब्याजदर ५.५ प्रतिशतबाट घटाएर ५.० प्रतिशत कायम गर्ने घोषणा गर्‍यो। यो निर्णयले बैंकिङ क्षेत्रमा तरलता सहजीकरण गर्नेछ र निजी क्षेत्रमा ऋण सहजरूपमा उपलब्ध हुनेछ।\n\nनेपाल उद्योग वाणिज्य महासंघका अध्यक्षले यस निर्णयलाई स्वागत गर्दै भने, "यसले उद्योग र व्यवसायलाई नयाँ ऊर्जा दिनेछ।" बैंकर्स एसोसिएशनले पनि यस निर्णयलाई सकारात्मक मानेको छ। विश्लेषकहरूका अनुसार यो कदमले मुद्रास्फीतिलाई नियन्त्रणमा राख्दै आर्थिक वृद्धिदर बढाउन सहयोग गर्नेछ।',
        contentEn: 'KATHMANDU — Nepal Rastra Bank today announced in its mid-term monetary policy review that it would lower the policy interest rate from 5.5% to 5.0%. This decision will ease liquidity in the banking sector and make loans more accessible to the private sector.\n\nThe president of the Federation of Nepalese Chambers of Commerce and Industry welcomed the move, saying, "This will give new energy to industry and business." The Bankers Association also viewed the decision positively. Analysts say the step will help boost economic growth while keeping inflation in check.',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
        author: 'Sita Devi Ghimire',
        date: '2026-03-30',
        views: 876,
      },
      {
        id: 'art-3',
        category: 'technology',
        title: 'नेपालमा ५जी सेवा सुरु, काठमाडौंमा पहिले सुविधा पाइने',
        titleEn: '5G Service Launches in Nepal, Kathmandu to Get Access First',
        summary: 'नेपाल टेलिकमले देशमा पहिलो पटक ५जी सेवा सुरु गरेको घोषणा गरेको छ। सुरुमा काठमाडौं उपत्यकामा सेवा उपलब्ध हुनेछ।',
        summaryEn: 'Nepal Telecom has announced the launch of 5G service in the country for the first time. The service will initially be available in the Kathmandu Valley.',
        content: 'काठमाडौं — नेपाल टेलिकमले आज देशमा ५जी सेवाको शुभारम्भ गरेको छ। प्रारम्भिक चरणमा काठमाडौं, ललितपुर र भक्तपुर जिल्लाका प्रमुख क्षेत्रहरूमा सेवा उपलब्ध हुनेछ। कम्पनीका प्रमुख कार्यकारी अधिकृतले भने, "हामी सन् २०२७ सम्म देशका ७५ जिल्लामा ५जी पुर्‍याउने लक्ष्य लिएका छौं।"\n\n५जी प्रविधिले प्रति सेकेन्ड १ गिगाबिटसम्मको डाउनलोड गति दिनेछ जुन हालको ४जी भन्दा १० गुणा बढी छ। यसले डिजिटल नेपालको सपनालाई साकार पार्न महत्वपूर्ण भूमिका खेल्नेछ।',
        contentEn: 'KATHMANDU — Nepal Telecom today launched 5G service in the country. In the initial phase, service will be available in key areas of Kathmandu, Lalitpur, and Bhaktapur districts. The company CEO said, "We aim to bring 5G to all 75 districts by 2027."\n\n5G technology will offer download speeds of up to 1 gigabit per second, ten times faster than current 4G. This will play a key role in realizing the dream of Digital Nepal.',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
        author: 'Bikash Thapa',
        date: '2026-03-29',
        views: 2100,
      },
      {
        id: 'art-4',
        category: 'sports',
        title: 'नेपाल क्रिकेट टोलीले भारतलाई हरायो, ऐतिहासिक जित',
        titleEn: 'Nepal Cricket Team Defeats India in Historic Win',
        summary: 'नेपाली क्रिकेट टोलीले एसिया कप क्वालिफायरमा भारतलाई ७ विकेटले हराएर ऐतिहासिक जित हासिल गरेको छ।',
        summaryEn: 'The Nepal cricket team achieved a historic win by defeating India by 7 wickets in the Asia Cup Qualifier, sending the nation into celebration.',
        content: 'काठमाडौं — नेपाली क्रिकेट टोलीले आज एसिया कप क्वालिफायरमा भारतलाई ७ विकेटले पराजित गर्दै ऐतिहासिक जित हासिल गरेको छ। यो नेपाली क्रिकेटको इतिहासमा एउटा स्वर्णिम क्षण हो। सम्पूर्ण देशमा खुसीयाली छाएको छ।\n\nकप्तान रोहित पौडेलको शानदार ७८ रनको पारी र दीपेन्द्र सिंह ऐरीको ३ विकेटले नेपाललाई यो जितमा पुर्‍यायो। नेपाल क्रिकेट संघका अध्यक्षले यसलाई "नेपाली खेलकुदको नयाँ युग" भनेका छन्।',
        contentEn: 'KATHMANDU — The Nepal cricket team achieved a historic victory today, defeating India by 7 wickets in the Asia Cup Qualifier. This is a golden moment in the history of Nepali cricket, and celebrations have erupted across the country.\n\nCaptain Rohit Paudel\'s brilliant 78-run innings and Dipendra Singh Airee\'s 3 wickets led Nepal to the win. The president of the Cricket Association of Nepal called it "a new era for Nepali sports."',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
        author: 'Anil KC',
        date: '2026-03-28',
        views: 5400,
      },
      {
        id: 'art-5',
        category: 'health',
        title: 'नेपालमा डेंगु बुखारको प्रकोप, स्वास्थ्य मन्त्रालयको सतर्कता',
        titleEn: 'Dengue Fever Outbreak in Nepal, Health Ministry Issues Alert',
        summary: 'नेपालका तराई जिल्लाहरूमा डेंगु बुखारका बिरामीहरूको संख्या बढेको छ। स्वास्थ्य मन्त्रालयले सतर्कता जारी गरेको छ।',
        summaryEn: 'The number of dengue fever cases is rising in Terai districts of Nepal. The Health Ministry has issued an alert and urged citizens to take preventive measures.',
        content: 'काठमाडौं — नेपालका तराई जिल्लाहरूमा डेंगु बुखारका बिरामीहरूको संख्या उल्लेखनीय रूपमा बढेको छ। स्वास्थ्य तथा जनसंख्या मन्त्रालयले यस सम्बन्धमा उच्च सतर्कता जारी गरेको छ।\n\nगत एक महिनाभित्र मात्र १,२०० भन्दा बढी बिरामीहरू अस्पतालमा भर्ना भएका छन्। मन्त्रालयका प्रवक्ताले नागरिकहरूलाई पानी जम्न नदिन, लामखुट्टे भगाउने क्रिम प्रयोग गर्न र लामो बाहुला लगाउन आग्रह गरेका छन्।',
        contentEn: 'KATHMANDU — The number of dengue fever patients in Nepal\'s Terai districts has risen significantly. The Ministry of Health and Population has issued a high-level alert. More than 1,200 patients were admitted to hospitals in the past month alone. Ministry spokesperson urged citizens not to let water stagnate, to use mosquito repellent, and to wear long sleeves.',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
        author: 'Dr. Priya Shrestha',
        date: '2026-03-27',
        views: 980,
      },
      {
        id: 'art-6',
        category: 'science',
        title: 'नेपाली वैज्ञानिकले हिमालयमा नयाँ प्रजातिको फूल फेला पारे',
        titleEn: 'Nepali Scientist Discovers New Flower Species in Himalayas',
        summary: 'त्रिभुवन विश्वविद्यालयका वनस्पतिशास्त्री डा. कमल रेग्मीले हिमाचल क्षेत्रमा नयाँ प्रजातिको फूल पत्ता लगाएका छन्।',
        summaryEn: 'Botanist Dr. Kamal Regmi from Tribhuvan University has discovered a new flower species in the Himalayan region, a find that could have medicinal significance.',
        content: 'काठमाडौं — त्रिभुवन विश्वविद्यालयका वनस्पतिशास्त्री डा. कमल रेग्मीले हिमाचल क्षेत्रको ४,५०० मिटर उचाइमा एउटा नयाँ प्रजातिको फूल पत्ता लगाएका छन्। यो फूललाई "Primula himalayensis regmii" नाम दिइएको छ।\n\nयस खोजलाई अन्तर्राष्ट्रिय वनस्पतिशास्त्र पत्रिकामा प्रकाशित गरिएको छ। यो फूलमा औषधीय गुण हुन सक्ने प्रारम्भिक अनुसन्धानले देखाएको छ र यसको थप अध्ययन हुने बताइएको छ।',
        contentEn: 'KATHMANDU — Botanist Dr. Kamal Regmi from Tribhuvan University has discovered a new flower species at an altitude of 4,500 meters in the Himalayan region. The flower has been named "Primula himalayensis regmii." The discovery has been published in an international botany journal. Preliminary research suggests the flower may have medicinal properties, and further study is planned.',
        image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc0e?w=800&q=80',
        author: 'Mina Maharjan',
        date: '2026-03-26',
        views: 670,
      },
      {
        id: 'art-7',
        category: 'entertainment',
        title: 'नेपाली चलचित्र "पर्खाल" ले अन्तर्राष्ट्रिय पुरस्कार जित्यो',
        titleEn: 'Nepali Film "Parkhaal" Wins International Award',
        summary: 'नेपाली चलचित्र "पर्खाल" ले बुसान अन्तर्राष्ट्रिय चलचित्र महोत्सवमा उत्कृष्ट एशियाई चलचित्रको पुरस्कार जितेको छ।',
        summaryEn: 'The Nepali film "Parkhaal" (The Wall) has won the Best Asian Film award at the Busan International Film Festival, marking a milestone for Nepali cinema.',
        content: 'काठमाडौं — नेपाली चलचित्र "पर्खाल" ले दक्षिण कोरियाको बुसानमा आयोजित बुसान अन्तर्राष्ट्रिय चलचित्र महोत्सवमा उत्कृष्ट एशियाई चलचित्रको पुरस्कार जितेको छ। यो नेपाली चलचित्र उद्योगको लागि ऐतिहासिक उपलब्धि हो।\n\nचलचित्रका निर्देशक सरोज बराँईले यो पुरस्कारलाई सम्पूर्ण नेपाली जनतालाई समर्पित गर्दै भने, "यो नेपाली कला र संस्कृतिको विश्व मञ्चमा चम्किने अवसर हो।"',
        contentEn: 'KATHMANDU — The Nepali film "Parkhaal" (The Wall) has won the Best Asian Film award at the Busan International Film Festival held in South Korea. This is a historic achievement for the Nepali film industry.\n\nDirector Saroj Baraai dedicated the award to all Nepali people, saying, "This is an opportunity for Nepali art and culture to shine on the world stage."',
        image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
        author: 'Sunita Rai',
        date: '2026-03-25',
        views: 3200,
      },
      {
        id: 'art-8',
        category: 'general',
        title: 'संसद्ले नयाँ शिक्षा विधेयक पारित गर्‍यो',
        titleEn: 'Parliament Passes New Education Bill',
        summary: 'प्रतिनिधि सभाले आज नयाँ शिक्षा विधेयक पारित गरेको छ जसले सरकारी विद्यालयहरूमा आमूल परिवर्तन ल्याउनेछ।',
        summaryEn: 'The House of Representatives has passed a new Education Bill today that will bring fundamental changes to government schools across Nepal.',
        content: 'काठमाडौं — प्रतिनिधि सभाले आज नयाँ शिक्षा विधेयक ठूलो बहुमतले पारित गरेको छ। यस विधेयकले सरकारी विद्यालयहरूमा पाठ्यक्रम सुधार, शिक्षक तालिम र डिजिटल शिक्षाको प्रबन्ध गर्नेछ।\n\nशिक्षा मन्त्रीले भने, "यो विधेयकले नेपालको शिक्षा प्रणालीलाई २१औं शताब्दीको माग अनुसार बनाउनेछ।" विपक्षी दलहरूले पनि यस विधेयकको समर्थन गरेका छन्।',
        contentEn: 'KATHMANDU — The House of Representatives today passed a new Education Bill with a large majority. The bill will reform the curriculum in government schools, provide teacher training, and establish digital education infrastructure.\n\nThe Education Minister said, "This bill will make Nepal\'s education system fit for the demands of the 21st century." Opposition parties also supported the bill.',
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
        author: 'Krishna Prasad Oli',
        date: '2026-03-24',
        views: 1550,
      },
    ];
    localStorage.setItem(this.KEYS.articles, JSON.stringify(defaults));
    return defaults;
  },

  saveArticles(articles) {
    localStorage.setItem(this.KEYS.articles, JSON.stringify(articles));
  },

  getArticleById(id) {
    return this.getArticles().find(a => a.id === id) || null;
  },

  addArticle(article) {
    const articles = this.getArticles();
    article.id    = 'art-' + Date.now();
    article.date  = new Date().toISOString().slice(0, 10);
    article.views = 0;
    articles.unshift(article);
    this.saveArticles(articles);
    return article;
  },

  updateArticle(id, data) {
    const articles = this.getArticles();
    const idx = articles.findIndex(a => a.id === id);
    if (idx === -1) return false;
    articles[idx] = { ...articles[idx], ...data };
    this.saveArticles(articles);
    return true;
  },

  deleteArticle(id) {
    const articles = this.getArticles().filter(a => a.id !== id);
    this.saveArticles(articles);
  },

  incrementViews(id) {
    const articles = this.getArticles();
    const art = articles.find(a => a.id === id);
    if (art) { art.views = (art.views || 0) + 1; this.saveArticles(articles); }
  },

  /* ── Users ────────────────────────────────────── */
  getUsers() {
    // Only return admin, no persistent user storage
    return [
      { id: 'user-admin', name: 'Admin', email: 'admin@nepalkhabar.com', password: 'admin123', role: 'admin' },
    ];
  },

  saveUsers(users) {
    // Only save admin, ignore other users
    const adminOnly = users.filter(u => u.role === 'admin');
    localStorage.setItem(this.KEYS.users, JSON.stringify(adminOnly));
  },

  registerUser(name, email, password) {
    // Don't save user registrations
    return { ok: false, error: 'User registration is not available. Only admin access allowed.' };
  },

  loginUser(email, password) {
    const users = this.getUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: 'Invalid email or password.' };
    const session = { id: user.id, name: user.name, email: user.email, role: user.role };
    sessionStorage.setItem(this.KEYS.session, JSON.stringify(session));
    return { ok: true, user: session };
  },

  logout() {
    sessionStorage.removeItem(this.KEYS.session);
  },

  getSession() {
    const raw = sessionStorage.getItem(this.KEYS.session);
    return raw ? JSON.parse(raw) : null;
  },

  /* ── Comments ─────────────────────────────────── */
  getComments(articleId) {
    // Don't persist comments
    return [];
  },

  addComment(articleId, text) {
    const session = this.getSession();
    if (!session) return { ok: false, error: 'Login required.' };
    if (session.role !== 'admin') return { ok: false, error: 'Only admin can post comments.' };
    // Don't save comments
    const comment = {
      id    : 'cmt-' + Date.now(),
      userId: session.id,
      name  : session.name,
      text  : text.trim(),
      date  : new Date().toLocaleString('en-NP'),
    };
    return { ok: true, comment };
  },

  deleteComment(articleId, commentId) {
    // No-op since comments aren't saved
  },

  getAllComments() {
    // Don't persist comments
    return {};
  },

  /* ── Subscribers ───────────────────────────────── */
  getSubscribers() {
    // Don't persist subscribers
    return [];
  },

  getSubscriberByEmail(email) {
    // Always return null since not persisted
    return null;
  },

  addSubscriber(data) {
    // Don't save subscribers
    return { ok: false, error: 'Subscription is not available.' };
  },

  deleteSubscriber(id) {
    // No-op since not saved
  },

  /* ── Submissions (Citizen News) ────────────────── */
  getSubmissions() {
    // Don't persist submissions
    return [];
  },

  addSubmission(data) {
    // Don't save submissions
    return null;
  },

  updateSubmissionStatus(id, status) {
    // No-op since not saved
  },

  deleteSubmission(id) {
    // No-op since not saved
  },
};
