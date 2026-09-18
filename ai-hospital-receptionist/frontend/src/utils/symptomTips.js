// Lightweight, client-side "quick tip" lookup for common symptoms.
//
// IMPORTANT: entries here are general, well-established self-care guidance —
// not a diagnosis, not dosing information, and never a substitute for
// professional care. For symptoms that can signal something serious (chest
// pain, fainting, blood in urine, heavy bleeding, etc.) the tip deliberately
// leads with "seek care" rather than routine self-care steps, and does not
// suggest the situation is minor. This list does not replace your existing
// AI/backend triage in ChatPage — it just gives an instant first response.
//
// Order matters: more specific keyword sets are placed before broader/generic
// ones so a specific phrase (e.g. "mild cough") matches its own tip rather
// than falling through to a more generic entry later in the list.

const SYMPTOM_TIPS = [
  // ── 🤒 Cold, Respiratory & ENT ──────────────────────────────────────────
  {
    keywords: ['mild cough', 'slight cough', 'dry cough', 'cough for a day'],
    title: '🍯 Quick tip for a mild cough',
    steps: [
      'Stay hydrated — warm fluids can soothe the throat.',
      'Rest your voice and avoid irritants like smoke.',
      'A warm drink with honey may help ease throat irritation.',
      'If you cough up blood, have chest pain, or shortness of breath, seek care immediately.',
    ],
  },
  {
    keywords: ['cough'],
    title: '🍯 Quick tip for cough',
    steps: [
      'Drink warm fluids and stay hydrated.',
      'Rest your voice and avoid smoke or strong odors.',
      'Try elevating your head slightly while resting to ease irritation.',
      'See a doctor if the cough lasts more than a couple of weeks, or if you cough up blood or have breathing difficulty.',
    ],
  },
  {
    keywords: ['common cold', 'i have a cold', 'caught a cold'],
    title: '🤧 Quick tip for a common cold',
    steps: [
      'Rest and stay well-hydrated.',
      'Warm fluids like soup or tea can ease throat and congestion discomfort.',
      'Use a humidifier or steam inhalation if congestion is bothersome.',
      'See a doctor if symptoms worsen after a week or high fever develops.',
    ],
  },
  {
    keywords: ['sore throat', 'throat pain', 'throat hurts'],
    title: '🍵 Quick tip for a sore throat',
    steps: [
      'Gargle with warm salt water a few times a day.',
      'Drink warm fluids and stay hydrated.',
      'Avoid smoking or irritants.',
      "See a doctor if it's severe, lasts more than a few days, or you have trouble swallowing/breathing.",
    ],
  },
  {
    keywords: ['runny nose', 'stuffy nose', 'blocked nose', 'nasal congestion'],
    title: '🤧 Quick tip for a runny/stuffy nose',
    steps: [
      'Stay hydrated to help thin mucus.',
      'Try steam inhalation to ease congestion.',
      'Use a saline nasal rinse if available.',
      'See a doctor if it persists beyond 10 days or is accompanied by facial pain and fever.',
    ],
  },
  {
    keywords: ['sneezing'],
    title: '🤧 Quick tip for sneezing',
    steps: [
      'Identify and avoid possible triggers (dust, pollen, strong smells).',
      'Keep your surroundings clean and well-ventilated.',
      'Stay hydrated.',
      'See a doctor if sneezing is persistent or affects daily activity.',
    ],
  },
  {
    keywords: ['sinus congestion', 'sinus pressure', 'sinusitis'],
    title: '💨 Quick tip for sinus congestion',
    steps: [
      'Try steam inhalation a few times a day.',
      'Stay hydrated to help thin mucus.',
      'Apply a warm compress over the sinus area for relief.',
      "See a doctor if you have facial pain, fever, or symptoms lasting more than 10 days.",
    ],
  },
  {
    keywords: ['earache', 'ear pain', 'ear hurts'],
    title: '👂 Quick tip for an earache',
    steps: [
      'Avoid inserting anything into the ear canal.',
      'A warm (not hot) compress against the ear may ease discomfort.',
      'Avoid swimming or getting water in the ear until it resolves.',
      'See a doctor if pain is severe, you have discharge, fever, or hearing changes.',
    ],
  },
  {
    keywords: ['ear blockage', 'ear feels blocked', 'blocked ear'],
    title: '👂 Quick tip for ear blockage',
    steps: [
      'Avoid inserting cotton buds or objects into the ear.',
      'Try gentle jaw movements (yawning, chewing) which can sometimes help.',
      "Avoid forcefully blowing your nose if related to congestion.",
      'See a doctor if blockage doesn\'t clear, or you have pain or hearing loss.',
    ],
  },

  // ── 🤕 Pain ─────────────────────────────────────────────────────────────
  {
    keywords: ['headache', 'mild headache', 'head hurts', 'head pain'],
    title: '🧊 Quick tip for headache',
    steps: [
      'Rest in a quiet, dimly lit room for a while.',
      'Drink water — headaches are often linked to dehydration.',
      'A cool compress on your forehead or neck can help.',
      "If it's the worst headache of your life, sudden, or comes with vision changes, seek care immediately.",
    ],
  },
  {
    keywords: ['back pain'],
    title: '🧎 Quick tip for back pain',
    steps: [
      'Rest in a comfortable position, avoiding activities that worsen the pain.',
      'Apply a warm or cold compress, whichever feels better.',
      'Avoid heavy lifting or sudden twisting movements.',
      'See a doctor if pain is severe, spreads down a leg, or you have numbness or weakness.',
    ],
  },
  {
    keywords: ['neck pain', 'stiff neck', 'neck stiffness'],
    title: '🧣 Quick tip for neck pain',
    steps: [
      'Rest the neck and avoid sudden or jerky movements.',
      'A warm compress can help relax the muscles.',
      'Maintain good posture, especially while sitting.',
      'See a doctor if neck stiffness comes with fever and headache, or pain is severe.',
    ],
  },
  {
    keywords: ['muscle pain', 'muscle ache'],
    title: '💪 Quick tip for muscle pain',
    steps: [
      'Rest the affected muscle and avoid strenuous activity.',
      'Apply a warm compress or take a warm shower.',
      'Gentle stretching may help once acute pain eases.',
      'See a doctor if pain is severe, sudden, or comes with swelling and redness.',
    ],
  },
  {
    keywords: ['joint pain'],
    title: '🦵 Quick tip for joint pain',
    steps: [
      'Rest the joint and avoid activities that worsen the pain.',
      "Apply a cold pack if there's swelling, or warmth if it's stiffness.",
      'Keep the joint gently elevated if possible.',
      'See a doctor if there\'s significant swelling, redness, warmth, or inability to move the joint.',
    ],
  },
  {
    keywords: ['chest pain', 'chest tightness', 'chest pressure'],
    title: '🚨 Chest pain needs prompt medical attention',
    steps: [
      "This can be a sign of a serious condition — please don't wait it out.",
      'If it\'s sudden, severe, spreading to your arm/jaw, or with breathlessness, call emergency services (108/911) now.',
      'Sit down, stay calm, and avoid exertion while you arrange help.',
      'Even mild or recurring chest discomfort should be evaluated by a doctor promptly.',
    ],
  },
  {
    keywords: ['toothache', 'tooth pain'],
    title: '🦷 Quick tip for a toothache',
    steps: [
      'Rinse your mouth with warm salt water.',
      'Avoid very hot, cold, or sugary foods that may worsen sensitivity.',
      'A cold compress on the outside of the cheek can ease discomfort.',
      'See a dentist soon — a toothache often needs professional treatment.',
    ],
  },
  {
    keywords: ['period pain', 'menstrual cramps', 'period cramps', 'cramps during period'],
    title: '🩸 Quick tip for period pain/cramps',
    steps: [
      'A warm compress or heating pad on the lower abdomen can help.',
      'Gentle movement or stretching sometimes eases cramps.',
      'Stay hydrated and rest as needed.',
      'See a doctor if pain is severe, sudden, or very different from your usual pattern.',
    ],
  },

  // ── 🌡️ General ──────────────────────────────────────────────────────────
  {
    keywords: ['mild fever', 'slight fever', 'low grade fever', 'feeling feverish'],
    title: '🌡️ Quick tip for mild fever',
    steps: [
      'Rest and keep yourself lightly dressed.',
      'Drink plenty of fluids.',
      'Monitor your temperature periodically.',
      'If fever climbs high, lasts more than a couple of days, or comes with a rash or stiff neck, seek care promptly.',
    ],
  },
  {
    keywords: ['fever'],
    title: '🌡️ Quick tip for fever',
    steps: [
      'Rest and stay hydrated.',
      'Dress lightly and keep your room comfortably cool.',
      'Monitor your temperature every few hours.',
      'Seek care if fever is very high, lasts more than 2–3 days, or comes with severe symptoms.',
    ],
  },
  {
    keywords: ['chills'],
    title: '🥶 Quick tip for chills',
    steps: [
      'Keep warm with a blanket, but avoid overheating.',
      'Stay hydrated.',
      'Monitor for accompanying fever.',
      'See a doctor if chills are severe, recurrent, or paired with high fever.',
    ],
  },
  {
    keywords: ['fatigue', 'feeling tired', 'exhausted', 'low energy', 'tiredness'],
    title: '🛌 Quick tip for fatigue',
    steps: [
      'Take a short rest if you can.',
      'Stay hydrated and have a light snack.',
      'Avoid strenuous activity until you feel better.',
      'If fatigue is severe, sudden, or paired with other symptoms, mention this to a doctor.',
    ],
  },
  {
    keywords: ['weakness', 'feeling weak'],
    title: '🪫 Quick tip for weakness',
    steps: [
      'Sit or lie down and rest.',
      "Have some water and a light snack if you haven't eaten.",
      'Avoid sudden exertion.',
      'If weakness is sudden, one-sided, or with slurred speech, this can be a medical emergency — seek care immediately.',
    ],
  },
  {
    keywords: ['body ache', 'body pain', 'aching all over'],
    title: '🧘 Quick tip for body aches',
    steps: [
      'Rest and avoid strenuous activity.',
      'Stay hydrated.',
      'A warm bath or gentle stretching may help ease discomfort.',
      'If aches are severe or accompanied by high fever, seek medical advice.',
    ],
  },
  {
    keywords: ['dehydration', 'feeling dehydrated', 'dehydrated'],
    title: '💧 Quick tip for dehydration',
    steps: [
      'Sip water or an oral rehydration solution slowly and steadily.',
      'Rest in a cool place, out of direct heat.',
      'Avoid caffeine and alcohol for now.',
      'Seek care if you have dizziness, very dark urine, or can\'t keep fluids down.',
    ],
  },
  {
    keywords: ['loss of appetite', 'no appetite', 'not feeling hungry'],
    title: '🍽️ Quick tip for loss of appetite',
    steps: [
      'Try small, light, frequent meals rather than large ones.',
      "Stay hydrated even if you're not eating much.",
      'Avoid forcing large meals — go gently.',
      'See a doctor if this persists more than a few days or comes with weight loss.',
    ],
  },

  // ── 🌀 Neurological / Sensory ───────────────────────────────────────────
  {
    keywords: ['dizzy', 'dizziness', 'feeling lightheaded', 'light headed', 'lightheaded', 'woozy'],
    title: '💧 Quick tip for dizziness',
    steps: [
      'Sit or lie down right away to avoid a fall.',
      'Sip some water slowly — dehydration is a common cause.',
      'Avoid standing up quickly for the next little while.',
      "If it doesn't ease up, or you feel faint, short of breath, or have chest pain, seek medical help.",
    ],
  },
  {
    keywords: ['faint', 'fainted', 'fainting', 'passed out', 'blacked out'],
    title: '🚨 Fainting needs prompt medical attention',
    steps: [
      'If you feel like you might faint, sit or lie down immediately and raise your legs.',
      'If someone has actually fainted, keep them lying down, loosen tight clothing, and elevate their legs.',
      "Once alert, help them sit up slowly — don't rush to standing.",
      "If they don't regain consciousness quickly, or this has happened before without explanation, seek medical care.",
    ],
  },
  {
    keywords: ['numbness', 'tingling', 'pins and needles'],
    title: '🖐️ Quick tip for numbness/tingling',
    steps: [
      'Change position — numbness from sitting/lying awkwardly often resolves with movement.',
      'Gently stretch or shake out the affected area.',
      'Avoid staying in one position for too long going forward.',
      'If numbness is sudden, one-sided, or with weakness or slurred speech, seek emergency care immediately.',
    ],
  },
  {
    keywords: ['balance problem', 'losing balance', 'trouble balancing', 'unsteady'],
    title: '⚖️ Quick tip for balance problems',
    steps: [
      'Move slowly and hold onto something stable if you feel unsteady.',
      'Sit down if you feel at risk of falling.',
      'Avoid stairs or uneven surfaces until it passes.',
      'See a doctor if balance issues are new, worsening, or recurring.',
    ],
  },

  // ── 🤢 Digestive ─────────────────────────────────────────────────────────
  {
    keywords: ['mild stomach pain', 'stomach ache', 'stomach discomfort', 'mild abdominal pain'],
    title: '🤲 Quick tip for mild stomach discomfort',
    steps: [
      'Rest and avoid heavy meals for a bit.',
      'Sip water slowly.',
      'A warm compress on the abdomen may offer relief.',
      'If pain is severe, worsening, or localized to one side, seek medical evaluation.',
    ],
  },
  {
    keywords: ['stomach pain', 'abdominal pain'],
    title: '🤲 Quick tip for stomach/abdominal pain',
    steps: [
      'Rest in a comfortable position.',
      'Sip water slowly; avoid heavy or spicy food for now.',
      'A warm compress may help ease cramping-type discomfort.',
      'Seek care promptly if pain is severe, sudden, or localized to one side (e.g. lower right).',
    ],
  },
  {
    keywords: ['acidity', 'heartburn'],
    title: '🔥 Quick tip for acidity/heartburn',
    steps: [
      'Avoid lying down right after eating.',
      'Steer clear of spicy, oily, or acidic foods for now.',
      'Eating smaller meals can help.',
      'See a doctor if it\'s frequent, severe, or you have trouble swallowing.',
    ],
  },
  {
    keywords: ['indigestion'],
    title: '🍽️ Quick tip for indigestion',
    steps: [
      'Eat smaller, lighter meals.',
      'Avoid lying down immediately after eating.',
      'Stay upright and give your stomach time to settle.',
      'See a doctor if discomfort is severe or persistent.',
    ],
  },
  {
    keywords: ['nausea', 'nauseous', 'feel like vomiting', 'queasy'],
    title: '🍵 Quick tip for nausea',
    steps: [
      'Sit upright and rest — avoid lying flat right after eating.',
      'Sip clear fluids slowly (water, ginger tea) rather than gulping.',
      'Avoid heavy, greasy, or spicy food for now.',
      'If nausea is severe, persistent, or with abdominal pain, seek medical evaluation.',
    ],
  },
  {
    keywords: ['vomiting', 'vomit', 'throwing up'],
    title: '🍵 Quick tip for vomiting',
    steps: [
      'Sip small amounts of water or oral rehydration solution frequently.',
      'Rest and avoid solid food until vomiting settles.',
      'Avoid lying flat immediately after vomiting.',
      'Seek care if vomiting is persistent, contains blood, or you show signs of dehydration.',
    ],
  },
  {
    keywords: ['diarrhea', 'loose motion', 'loose motions'],
    title: '💧 Quick tip for diarrhea',
    steps: [
      'Sip fluids or oral rehydration solution frequently to stay hydrated.',
      'Eat light, bland food as tolerated.',
      'Avoid unprescribed anti-diarrheal medication without medical advice.',
      "Seek care if there's blood, high fever, severe pain, or signs of dehydration.",
    ],
  },
  {
    keywords: ['constipation'],
    title: '🚻 Quick tip for constipation',
    steps: [
      'Drink plenty of water throughout the day.',
      'Add fiber-rich foods like fruits and vegetables if you can.',
      'Light physical activity, like walking, can help.',
      'See a doctor if it persists more than a week or you have severe pain/bloating.',
    ],
  },
  {
    keywords: ['bloating', 'bloated'],
    title: '🎈 Quick tip for bloating',
    steps: [
      'Avoid carbonated drinks and very fatty or spicy foods for now.',
      'Try light movement or a short walk.',
      'Eat slowly and in smaller portions.',
      'See a doctor if bloating is persistent, painful, or with other digestive changes.',
    ],
  },

  // ── 🩸 Menstrual / Women's Health ───────────────────────────────────────
  {
    keywords: ['irregular period', 'irregular periods'],
    title: '🩸 Quick tip for irregular periods',
    steps: [
      'Track your cycle for a couple of months to note the pattern.',
      'Manage stress and maintain regular sleep where possible.',
      'This is common and often not urgent, but worth mentioning at a checkup.',
      'See a doctor if it\'s persistent, or paired with severe pain or heavy bleeding.',
    ],
  },
  {
    keywords: ['heavy period', 'heavy menstrual bleeding', 'heavy bleeding during period'],
    title: '🚨 Heavy menstrual bleeding — please get this checked',
    steps: [
      "If you're soaking through a pad/tampon every hour for several hours, or feeling dizzy/weak, seek medical care promptly.",
      'Rest and stay hydrated while you arrange care.',
      'Track how often you\'re changing protection to describe to a doctor.',
      "Don't just wait it out if this is unusual for you — it's worth a prompt evaluation.",
    ],
  },
  {
    keywords: ['missed period', 'period is late', 'late period'],
    title: '🩸 About a missed period',
    steps: [
      'A missed period can have several causes (stress, changes in routine, and others).',
      'If pregnancy is a possibility, a home pregnancy test can help clarify things.',
      "Track any other symptoms you're noticing.",
      'See a doctor if periods are missed repeatedly or you have concerning symptoms.',
    ],
  },
  {
    keywords: ['pms', 'pms symptoms', 'premenstrual'],
    title: '🩸 Quick tip for PMS symptoms',
    steps: [
      'Light exercise and regular sleep can help ease symptoms.',
      'Stay hydrated and reduce caffeine/salt intake where possible.',
      'A warm compress can help with cramping or discomfort.',
      'See a doctor if symptoms significantly disrupt daily life.',
    ],
  },
  {
    keywords: ['period headache', 'period-related headache', 'menstrual headache'],
    title: '🧊 Quick tip for a period-related headache',
    steps: [
      'Rest in a quiet, dim room.',
      'Stay hydrated.',
      'A cool compress on the forehead may help.',
      'See a doctor if headaches are severe or significantly disrupt your cycle each month.',
    ],
  },
  {
    keywords: ['period nausea', 'period-related nausea', 'menstrual nausea'],
    title: '🍵 Quick tip for period-related nausea',
    steps: [
      'Sip clear fluids slowly, like water or ginger tea.',
      'Eat small, light meals rather than large ones.',
      'Rest in a comfortable position.',
      'See a doctor if nausea is severe or paired with intense pain.',
    ],
  },

  // ── 🌿 Allergy ───────────────────────────────────────────────────────────
  {
    keywords: ['skin itching', 'itchy skin', 'itching'],
    title: '🌿 Quick tip for skin itching',
    steps: [
      'Avoid scratching, which can worsen irritation.',
      'A cool compress can help soothe the area.',
      'Wear loose, breathable clothing.',
      'See a doctor if itching is severe, widespread, or with swelling/breathing trouble.',
    ],
  },
  {
    keywords: ['skin rash', 'minor rash', 'rash'],
    title: '🌿 Quick tip for a skin rash',
    steps: [
      'Avoid scratching or irritating the area further.',
      'Keep the area clean and dry.',
      'Avoid new soaps, lotions, or fabrics that might be a trigger.',
      'See a doctor if the rash spreads quickly, blisters, or comes with fever or breathing difficulty.',
    ],
  },
  {
    keywords: ['watery eyes', 'itchy eyes'],
    title: '👁️ Quick tip for watery/itchy eyes',
    steps: [
      'Avoid rubbing your eyes.',
      'A cool, damp cloth over closed eyes can help.',
      'Try to identify and avoid the trigger (dust, pollen, smoke).',
      "See a doctor if there's pain, vision changes, or discharge.",
    ],
  },
  {
    keywords: ['allergic rhinitis', 'seasonal allergy', 'allergy mild'],
    title: '🌿 Quick tip for allergic rhinitis',
    steps: [
      'Try to identify and limit exposure to the trigger.',
      'Rinse your nose with saline if available.',
      'Keep windows closed during high-pollen times if that\'s a factor.',
      'See a doctor if symptoms are frequent or significantly affect your daily life.',
    ],
  },
  {
    keywords: ['allergic swelling', 'swelling due to allergy', 'allergy swelling'],
    title: '🚨 Allergic swelling needs prompt attention',
    steps: [
      'If swelling is around the face, lips, tongue, or throat, or you have trouble breathing, this is an emergency — call 108/911 immediately.',
      'For localized mild swelling, a cool compress can help.',
      'Try to identify and avoid the trigger going forward.',
      'See a doctor for evaluation even if it seems to settle down.',
    ],
  },

  // ── 👁️ Eye ──────────────────────────────────────────────────────────────
  {
    keywords: ['eye redness', 'red eye', 'red eyes'],
    title: '👁️ Quick tip for eye redness',
    steps: [
      'Avoid rubbing your eyes.',
      'A cool compress can offer relief.',
      'Avoid contact lenses until it clears up.',
      "See a doctor if there's pain, vision changes, discharge, or sensitivity to light.",
    ],
  },
  {
    keywords: ['eye irritation', 'eye discomfort'],
    title: '👁️ Quick tip for eye irritation',
    steps: [
      "Rinse gently with clean water if there's something in the eye.",
      'Avoid rubbing.',
      'Rest your eyes and reduce screen time if possible.',
      'See a doctor if irritation persists or worsens.',
    ],
  },
  {
    keywords: ['dry eyes'],
    title: '👁️ Quick tip for dry eyes',
    steps: [
      'Blink often, especially during screen use.',
      'Take regular breaks from screens.',
      'Stay hydrated.',
      'See a doctor if dryness is persistent or uncomfortable.',
    ],
  },
  {
    keywords: ['blurred vision', 'blurry vision'],
    title: '👁️ Blurred vision — worth prompt attention',
    steps: [
      "If it's sudden, or affects only one eye, or comes with headache/weakness, seek medical care promptly — this can be serious.",
      'Rest your eyes and avoid straining them further.',
      "Note when it started and whether it's constant or comes and goes.",
      'See a doctor for a proper eye evaluation even if it seems to improve.',
    ],
  },

  // ── 🧴 Skin ──────────────────────────────────────────────────────────────
  {
    keywords: ['acne', 'pimples'],
    title: '🧴 Quick tip for acne',
    steps: [
      'Keep the area clean with a gentle cleanser — avoid harsh scrubbing.',
      'Avoid picking or popping pimples.',
      'Use non-comedogenic (non-pore-blocking) skin products where possible.',
      "See a dermatologist if it's persistent, painful, or leaving scars.",
    ],
  },
  {
    keywords: ['dry skin'],
    title: '🧴 Quick tip for dry skin',
    steps: [
      'Moisturize regularly, especially after bathing.',
      'Use lukewarm (not hot) water when washing.',
      'Stay hydrated.',
      'See a doctor if dryness is severe, cracked, or itchy despite moisturizing.',
    ],
  },
  {
    keywords: ['skin infection'],
    title: '🧴 Skin infection — worth getting checked',
    steps: [
      'Keep the area clean and avoid touching/scratching it.',
      "Avoid covering it with non-breathable materials.",
      "Don't attempt to drain or squeeze it yourself.",
      'See a doctor, especially if there\'s spreading redness, pus, warmth, or fever.',
    ],
  },
  {
    keywords: ['minor cut', 'minor wound', 'small cut'],
    title: '🩹 Quick tip for a minor cut/wound',
    steps: [
      'Clean gently with water and mild soap.',
      "Apply light pressure with a clean cloth if it's bleeding a little.",
      'Cover with a clean bandage.',
      "See a doctor if it's deep, won't stop bleeding, or shows signs of infection.",
    ],
  },
  {
    keywords: ['hair loss', 'hair fall'],
    title: '💇 Quick tip for hair loss',
    steps: [
      'Handle hair gently — avoid tight hairstyles and harsh brushing.',
      'Maintain a balanced diet.',
      'Manage stress where possible, as it can contribute to hair loss.',
      'See a doctor if hair loss is sudden, patchy, or significant.',
    ],
  },
  {
    keywords: ['dandruff'],
    title: '💇 Quick tip for dandruff',
    steps: [
      'Wash hair regularly with a gentle shampoo.',
      'Avoid scratching the scalp.',
      'Consider a dandruff-specific shampoo if it persists.',
      'See a doctor if it\'s severe, itchy, or associated with redness.',
    ],
  },

  // ── 🚽 Urinary ───────────────────────────────────────────────────────────
  {
    keywords: ['burning while urinating', 'burning urination', 'pain while urinating'],
    title: '🚽 Burning while urinating — worth getting checked',
    steps: [
      'Drink plenty of water to help flush the urinary tract.',
      'Avoid holding urine for long periods.',
      'Avoid caffeine and alcohol for now, which can irritate the bladder.',
      'See a doctor soon — this often needs treatment (e.g. for a possible infection).',
    ],
  },
  {
    keywords: ['frequent urination', 'urinating frequently', 'peeing a lot'],
    title: '🚽 Quick tip for frequent urination',
    steps: [
      'Note how much fluid (especially caffeine/alcohol) you\'re drinking.',
      'Stay hydrated with water, but avoid excessive intake right before rest.',
      'Track the pattern to share with a doctor.',
      "See a doctor if it's new, persistent, or with pain or urgency.",
    ],
  },
  {
    keywords: ['difficulty urinating', 'trouble urinating', 'cant urinate', "can't urinate"],
    title: '🚨 Difficulty urinating — please get this checked',
    steps: [
      "If you're completely unable to urinate and feel bladder fullness or pain, seek care promptly.",
      'Avoid excessive fluid intake in the meantime if straining is difficult.',
      'Note when it started and any related symptoms.',
      'This usually needs a proper medical evaluation.',
    ],
  },
  {
    keywords: ['blood in urine'],
    title: '🚨 Blood in urine needs prompt medical attention',
    steps: [
      "This should be evaluated by a doctor — please don't wait it out.",
      'Stay hydrated in the meantime.',
      'Note any other symptoms (pain, fever) to describe to your doctor.',
      'Seek urgent care if there\'s significant pain, heavy bleeding, or you feel unwell.',
    ],
  },

  // ── 🦷 Dental / Oral ─────────────────────────────────────────────────────
  {
    keywords: ['gum pain', 'bleeding gums', 'gums hurt'],
    title: '🦷 Quick tip for gum pain',
    steps: [
      'Rinse with warm salt water.',
      'Brush gently with a soft-bristled brush.',
      'Avoid very hot, cold, or hard foods for now.',
      'See a dentist if pain, bleeding, or swelling persists.',
    ],
  },
  {
    keywords: ['mouth ulcer', 'mouth ulcers', 'canker sore'],
    title: '👄 Quick tip for mouth ulcers',
    steps: [
      'Avoid spicy, acidic, or very hot food that can irritate the area.',
      'Rinse with warm salt water a few times a day.',
      'Keep the mouth clean with gentle brushing.',
      "See a doctor/dentist if ulcers are large, very painful, or don't heal in 1–2 weeks.",
    ],
  },
  {
    keywords: ['tooth sensitivity', 'sensitive teeth'],
    title: '🦷 Quick tip for tooth sensitivity',
    steps: [
      'Avoid very hot, cold, or sweet foods/drinks for now.',
      'Use a soft-bristled toothbrush.',
      'Consider a toothpaste made for sensitive teeth.',
      'See a dentist if sensitivity is new, worsening, or persistent.',
    ],
  },
  {
    keywords: ['bad breath', 'halitosis'],
    title: '👄 Quick tip for bad breath',
    steps: [
      'Maintain regular brushing and tongue cleaning.',
      'Stay hydrated — a dry mouth can contribute to this.',
      "Limit strong-smelling foods if it's a recurring concern.",
      'See a dentist if it persists despite good oral hygiene.',
    ],
  },

  // ── 💤 Other Common Concerns ─────────────────────────────────────────────
  {
    keywords: ['sleep problem', 'trouble sleeping', 'insomnia', "can't sleep", 'cant sleep'],
    title: '💤 Quick tip for sleep problems',
    steps: [
      'Try to keep a consistent sleep and wake time.',
      'Avoid caffeine and screens close to bedtime.',
      'Keep your sleep environment cool, dark, and quiet.',
      'See a doctor if sleep problems are persistent and affecting your daily life.',
    ],
  },
  {
    keywords: ['stress', 'feeling stressed'],
    title: '🧘 Quick tip for stress',
    steps: [
      'Try a few minutes of slow, deep breathing.',
      'Take a short break from whatever is causing pressure, if you can.',
      'Reach out to someone you trust to talk it through.',
      'Consider speaking with a professional if stress feels persistent or overwhelming.',
    ],
  },
  {
    keywords: ['anxiety', 'feeling anxious', 'mild anxiety'],
    title: '🧘 Quick tip for anxiety',
    steps: [
      'Try slow, deep breathing — in for 4 counts, out for 6.',
      'Ground yourself by naming a few things you can see, hear, and feel.',
      'Step away from the immediate stressor if possible.',
      'Consider reaching out to a mental health professional if this is frequent or intense — support is available and effective.',
    ],
  },
  {
    keywords: ['difficulty concentrating', 'trouble concentrating', 'cant focus', "can't focus"],
    title: '🧠 Quick tip for difficulty concentrating',
    steps: [
      'Take short, regular breaks rather than pushing through fatigue.',
      "Make sure you're hydrated and have eaten recently.",
      'Reduce distractions where you can.',
      'See a doctor if this is persistent, sudden, or affecting daily function.',
    ],
  },
]

/**
 * Returns the first matching tip object for the given free-text symptom
 * description, or null if nothing matches. Case-insensitive substring match.
 */
export function getSymptomTip(text) {
  if (!text) return null
  const lower = text.toLowerCase()
  for (const tip of SYMPTOM_TIPS) {
    if (tip.keywords.some((k) => lower.includes(k))) {
      return tip
    }
  }
  return null
}

/**
 * Formats a tip object into a single markdown-ish string, matching the
 * style already used for buildInitialMessage in ChatPage (bold + \n).
 */
export function formatSymptomTip(tip) {
  const stepsText = tip.steps.map((s) => `• ${s}`).join('\n')
  return `**${tip.title}**\n\n${stepsText}`
}