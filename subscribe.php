<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Subscribe & Share News — Nepal Khabar</title>
  <meta name="description" content="Subscribe to Nepal Khabar and share your local news stories with the world." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Source+Serif+4:wght@300;400;600&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/subscribe.css" />
</head>
<body class="subscribe-page">

  <!-- HEADER -->
  <header class="site-header">
    <div class="header-inner">
      <a href="index.php" class="site-logo">Nepal<span>Khabar</span></a>
      <div class="header-actions">
        <a href="index.php" class="btn-header btn-header-outline">← Back to News</a>
      </div>
    </div>
  </header>

  <!-- HERO -->
  <div class="sub-hero">
    <div class="sub-hero-badge">📰 Citizen Journalism</div>
    <h1>Share Your Local Story</h1>
    <p>Subscribe and send us your local news, incidents and stories — तपाईंको समाचार नेपालसम्म पुर्‍याउनुहोस्</p>
  </div>

  <!-- STEPS INDICATOR -->
  <div class="sub-steps">
    <div class="sub-step-block">
      <div class="sub-step-num">1</div>
      <div class="sub-step-label">Subscribe</div>
    </div>
    <div class="sub-step-block">
      <div class="sub-step-num">2</div>
      <div class="sub-step-label">Submit News</div>
    </div>
    <div class="sub-step-block">
      <div class="sub-step-num">3</div>
      <div class="sub-step-label">Done!</div>
    </div>
  </div>

  <div class="sub-container">

    <!-- STEP 1: SUBSCRIBE -->
    <div id="stepSubscribe" class="sub-card">
      <div class="sub-card-title">Step 1: Subscribe</div>
      <div class="sub-card-sub">Already subscribed? Enter your email and we'll recognise you automatically.</div>

      <div class="sub-grid">
        <div class="sub-field">
          <label for="subFirstName">First Name *</label>
          <input type="text" id="subFirstName" placeholder="Hari" autocomplete="given-name" />
        </div>
        <div class="sub-field">
          <label for="subLastName">Last Name *</label>
          <input type="text" id="subLastName" placeholder="Bahadur" autocomplete="family-name" />
        </div>
        <div class="sub-field full">
          <label for="subEmail">Email Address *</label>
          <input type="email" id="subEmail" placeholder="you@example.com" autocomplete="email" />
        </div>
        <div class="sub-field">
          <label for="subPhone">Phone <span class="sub-opt">(optional)</span></label>
          <input type="tel" id="subPhone" placeholder="+977 98XXXXXXXX" autocomplete="tel" />
        </div>
        <div class="sub-field">
          <label for="subLocation">District / Location *</label>
          <input type="text" id="subLocation" placeholder="Kathmandu, Pokhara…" autocomplete="address-level2" />
        </div>
        <div class="sub-field full">
          <label class="sub-agree">
            <input type="checkbox" id="subAgree" />
            I agree to Nepal Khabar's <a href="index.php" style="color:var(--red);">terms of service</a> and consent to being contacted regarding my submissions.
          </label>
        </div>
      </div>

      <button class="btn-subscribe" id="btnSubscribe">Subscribe & Continue →</button>
      <div id="subMsg" class="sub-msg"></div>
    </div>

    <!-- STEP 2: SUBMIT NEWS -->
    <div id="stepSubmit" class="sub-card" style="display:none;">
      <span class="sub-badge" id="subBadge">Subscribed</span>
      <div class="sub-card-title">Step 2: Submit Your News</div>
      <div class="sub-card-sub">Fill in the details of the incident or story you wish to share.</div>

      <div class="sub-grid">
        <div class="sub-field full">
          <label for="newsTitle">News Title (English) *</label>
          <input type="text" id="newsTitle" placeholder="Short, clear headline in English" />
        </div>
        <div class="sub-field full">
          <label for="newsTitleNp">शीर्षक (नेपाली) <span class="sub-opt">(optional)</span></label>
          <input type="text" id="newsTitleNp" placeholder="नेपालीमा शीर्षक" />
        </div>
        <div class="sub-field">
          <label for="newsLocation">Incident Location *</label>
          <input type="text" id="newsLocation" placeholder="Village / City, District" />
        </div>
        <div class="sub-field">
          <label for="newsDate">Incident Date *</label>
          <input type="date" id="newsDate" />
        </div>
        <div class="sub-field full">
          <label for="newsCategory">Category *</label>
          <select id="newsCategory">
            <option value="">— Select category —</option>
            <option value="general">General</option>
            <option value="business">Business</option>
            <option value="technology">Technology</option>
            <option value="science">Science</option>
            <option value="health">Health</option>
            <option value="sports">Sports</option>
            <option value="entertainment">Entertainment</option>
          </select>
        </div>
        <div class="sub-field full">
          <label for="newsSummary">Brief Summary (English) *</label>
          <textarea id="newsSummary" placeholder="2–3 sentences summarising what happened…"></textarea>
        </div>
        <div class="sub-field full">
          <label for="newsSummaryNp">सारांश (नेपाली) <span class="sub-opt">(optional)</span></label>
          <textarea id="newsSummaryNp" placeholder="नेपालीमा सारांश…"></textarea>
        </div>
        <div class="sub-field full">
          <label for="newsBody">Full News Details (English) *</label>
          <textarea id="newsBody" style="min-height:140px;" placeholder="Tell the full story with as much detail as possible…"></textarea>
        </div>
        <div class="sub-field full">
          <label for="newsBodyNp">पूर्ण विवरण (नेपाली) <span class="sub-opt">(optional)</span></label>
          <textarea id="newsBodyNp" style="min-height:120px;" placeholder="नेपालीमा पूर्ण विवरण…"></textarea>
        </div>
        <div class="sub-field full">
          <label for="newsSource">Source / Reference <span class="sub-opt">(optional)</span></label>
          <input type="text" id="newsSource" placeholder="URL or source name" />
        </div>

        <!-- Photo Upload -->
        <div class="sub-field full">
          <label>Photo <span class="sub-opt">(optional — JPG, PNG, WEBP up to 5MB)</span></label>
          <div class="photo-drop-zone" id="photoDropZone">
            <div class="photo-drop-inner" id="photoDropInner">
              <div class="photo-drop-icon">📷</div>
              <div class="photo-drop-text">Click to upload or drag & drop a photo</div>
              <div class="photo-drop-hint">JPG · PNG · WEBP · max 5MB</div>
            </div>
            <div class="photo-preview" id="photoPreview">
              <img id="photoPreviewImg" src="" alt="Preview" />
              <button class="btn-remove-photo" id="btnRemovePhoto" type="button">✕ Remove</button>
            </div>
          </div>
          <input type="file" id="newsPhoto" accept="image/jpeg,image/png,image/webp" style="display:none;" />
          <div id="photoMsg" class="sub-msg"></div>
        </div>
      </div>

      <div id="submitMsg" class="sub-msg"></div>
      <button class="btn-submit-news" id="btnSubmitNews">📨 Submit My News →</button>
      <button class="btn-back-sub" id="btnBackToSub" type="button">← Back to Step 1</button>
    </div>

    <!-- STEP 3: SUCCESS -->
    <div id="stepSuccess" class="sub-card success-card" style="display:none;">
      <div class="success-icon">🎉</div>
      <div class="success-title">Submission Received!</div>
      <div class="success-msg" id="successMsg">Thank you! Your news has been received and is pending editorial review.</div>
      <button class="btn-submit-another" id="btnSubmitAnother">Submit Another Story</button>
      <br /><br />
      <a href="index.php" style="font-family:var(--font-ui);font-size:0.88rem;color:var(--red);">← Return to Nepal Khabar</a>
    </div>

  </div>

  <!-- FOOTER -->
  <footer class="site-footer">
    <p>© 2026 <strong>Nepal Khabar</strong> · नेपाल खबर · All rights reserved</p>
    <p style="margin-top:8px;">
      <a href="index.php">Home</a> &nbsp;·&nbsp;
      <a href="login.php">Login</a> &nbsp;·&nbsp;
      <a href="register.php">Register</a>
    </p>
  </footer>

  <script src="js/data.js"></script>
  <script src="js/subscribe.js"></script>
</body>
</html>
