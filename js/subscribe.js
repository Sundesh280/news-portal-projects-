/* subscribe.js */
var currentSubscriber = null;
var photoBase64 = null;

document.addEventListener('DOMContentLoaded', function() {
  var newsDateEl = document.getElementById('newsDate');
  if (newsDateEl) newsDateEl.value = new Date().toISOString().split('T')[0];
  document.getElementById('btnSubscribe').addEventListener('click', handleSubscribe);
  document.getElementById('btnBackToSub').addEventListener('click', function() { show('stepSubscribe'); hide('stepSubmit'); hide('stepSuccess'); });
  document.getElementById('btnSubmitNews').addEventListener('click', handleSubmitNews);
  document.getElementById('btnSubmitAnother').addEventListener('click', function() { clearNewsForm(); photoBase64=null; show('stepSubmit'); hide('stepSuccess'); });
  setupPhotoUpload();
});

function handleSubscribe() {
  var firstName = v('subFirstName').trim();
  var lastName  = v('subLastName').trim();
  var email     = v('subEmail').trim().toLowerCase();
  var phone     = v('subPhone').trim();
  var location  = v('subLocation').trim();
  var agreed    = document.getElementById('subAgree').checked;
  if (!firstName)                return showMsg('subMsg','Please enter your first name.','error');
  if (!lastName)                 return showMsg('subMsg','Please enter your last name.','error');
  if (!email||!isEmail(email))   return showMsg('subMsg','Please enter a valid email address.','error');
  if (!location)                 return showMsg('subMsg','Please enter your district / location.','error');
  if (!agreed)                   return showMsg('subMsg','Please agree to the terms of service.','error');
  var existing = DB.getSubscriberByEmail(email);
  if (existing) {
    currentSubscriber = existing;
    showMsg('subMsg','✅ Welcome back, '+existing.firstName+'! Proceeding to news submission.','success');
    setTimeout(goToStep2, 900); return;
  }
  var sub = DB.addSubscriber({firstName,lastName,email,phone,location});
  if (!sub.ok) return showMsg('subMsg',sub.error,'error');
  currentSubscriber = sub.subscriber;
  showMsg('subMsg','🎉 Subscribed successfully! Proceeding to news submission…','success');
  setTimeout(goToStep2, 900);
}

function goToStep2() {
  hide('stepSubscribe'); show('stepSubmit'); hide('stepSuccess');
  var badge = document.getElementById('subBadge');
  if (badge && currentSubscriber) badge.textContent='Subscribed as: '+currentSubscriber.firstName+' '+currentSubscriber.lastName+' ('+currentSubscriber.email+')';
  window.scrollTo({top:0,behavior:'smooth'});
}

function handleSubmitNews() {
  if (!currentSubscriber) { showMsg('submitMsg','Session expired. Please go back.','error'); return; }
  var titleEn=v('newsTitle').trim(), titleNp=v('newsTitleNp').trim(), location=v('newsLocation').trim(),
      date=v('newsDate').trim(), category=v('newsCategory'), summaryEn=v('newsSummary').trim(),
      summaryNp=v('newsSummaryNp').trim(), bodyEn=v('newsBody').trim(), bodyNp=v('newsBodyNp').trim(), source=v('newsSource').trim();
  if (!titleEn&&!titleNp) return showMsg('submitMsg','Please enter a news title.','error');
  if (!location)          return showMsg('submitMsg','Please enter the incident location.','error');
  if (!date)              return showMsg('submitMsg','Please select the incident date.','error');
  if (!category)          return showMsg('submitMsg','Please select a news category.','error');
  if (!summaryEn&&!summaryNp) return showMsg('submitMsg','Please enter a brief summary.','error');
  if (!bodyEn&&!bodyNp)   return showMsg('submitMsg','Please enter the full news details.','error');
  DB.addSubmission({subscriberId:currentSubscriber.id,subscriberName:currentSubscriber.firstName+' '+currentSubscriber.lastName,subscriberEmail:currentSubscriber.email,subscriberLocation:currentSubscriber.location,titleEn,titleNp,location,date,category,summaryEn,summaryNp,bodyEn,bodyNp,source,photo:photoBase64||null,submittedAt:new Date().toISOString(),status:'pending'});
  var sm = document.getElementById('successMsg');
  if (sm) sm.textContent='Thank you, '+currentSubscriber.firstName+'! Your news about "'+(titleEn||titleNp)+'" has been received and is pending editorial review.';
  hide('stepSubscribe'); hide('stepSubmit'); show('stepSuccess');
  window.scrollTo({top:0,behavior:'smooth'});
}

function setupPhotoUpload() {
  var dz=document.getElementById('photoDropZone'),di=document.getElementById('photoDropInner'),
      pv=document.getElementById('photoPreview'),pi=document.getElementById('photoPreviewImg'),
      fi=document.getElementById('newsPhoto'),rb=document.getElementById('btnRemovePhoto');
  if (!dz||!fi) return;
  dz.addEventListener('click',function(e){ if(e.target===rb||rb.contains(e.target))return; if(pv.style.display!=='none')return; fi.click(); });
  dz.addEventListener('dragover',function(e){ e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave',function(){ dz.classList.remove('drag-over'); });
  dz.addEventListener('drop',function(e){ e.preventDefault(); dz.classList.remove('drag-over'); var f=e.dataTransfer.files[0]; if(f) processPhoto(f); });
  fi.addEventListener('change',function(){ if(fi.files[0]) processPhoto(fi.files[0]); });
  rb.addEventListener('click',function(e){ e.stopPropagation(); photoBase64=null; fi.value=''; pv.style.display='none'; di.style.display='flex'; hideMsg('photoMsg'); });
  function processPhoto(file) {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { showMsg('photoMsg','Only JPG, PNG or WEBP allowed.','error'); return; }
    if (file.size>5*1024*1024) { showMsg('photoMsg','Photo must be under 5MB.','error'); return; }
    hideMsg('photoMsg');
    var reader=new FileReader();
    reader.onload=function(e){ photoBase64=e.target.result; pi.src=photoBase64; di.style.display='none'; pv.style.display='block'; };
    reader.readAsDataURL(file);
  }
}

function v(id){ var el=document.getElementById(id); return el?el.value:''; }
function show(id){ var el=document.getElementById(id); if(el) el.style.display=''; }
function hide(id){ var el=document.getElementById(id); if(el) el.style.display='none'; }
function isEmail(s){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
function showMsg(id,text,type){ var el=document.getElementById(id); if(!el)return; el.textContent=text; el.className='sub-msg '+type; }
function hideMsg(id){ var el=document.getElementById(id); if(el){ el.textContent=''; el.className='sub-msg'; } }
function clearNewsForm() {
  ['newsTitle','newsTitleNp','newsLocation','newsDate','newsCategory','newsSummary','newsSummaryNp','newsBody','newsBodyNp','newsSource'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=id==='newsDate'?new Date().toISOString().split('T')[0]:''; });
  var pv=document.getElementById('photoPreview'),di=document.getElementById('photoDropInner'),pi=document.getElementById('photoPreviewImg'),fi=document.getElementById('newsPhoto');
  if(pv) pv.style.display='none'; if(di) di.style.display='flex'; if(pi) pi.src=''; if(fi) fi.value=''; photoBase64=null;
}
