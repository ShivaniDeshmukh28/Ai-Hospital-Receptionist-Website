import { useState, useRef, useEffect, useCallback } from 'react'

export default function EmergencyTriageTab({ onNavigate }) {
  const [symptoms, setSymptoms] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // Body map state
  const [region, setRegion] = useState(null)      // e.g. 'chest'
  const [subPart, setSubPart] = useState(null)    // e.g. 'Upper Leg'

  // Ambulance connectivity state
  const [geo, setGeo] = useState(null)          // { lat, lng, accuracy, time }
  const [geoStatus, setGeoStatus] = useState('') // '', 'locating', error message
  const [copied, setCopied] = useState('')
  const [called, setCalled] = useState(null)     // time the call button was used

  // Camera state
  const [camOpen, setCamOpen] = useState(false)
  const [camError, setCamError] = useState('')
  const [photos, setPhotos] = useState([])        // [{ id, dataUrl, label, time }]
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileRef = useRef(null)

  // ── Keyword banks, grouped by condition type ──────────────────────────────
  // EMERGENCY: anything immediately life- or limb-threatening
  const EMERGENCY_GROUPS = {
    cardiac: [
      'heart attack', 'cardiac arrest', 'chest pain', 'chest pressure', 'chest tightness',
      'crushing pain', 'pain radiating to arm', 'pain in left arm', 'pain in jaw',
      'palpitations with pain', 'heart racing and dizzy',
    ],
    stroke: [
      'stroke', 'face drooping', 'slurred speech', 'sudden confusion', 'sudden numbness',
      'sudden weakness one side', 'can\'t speak', 'cannot speak', 'facial droop',
      'sudden vision loss', 'worst headache of my life', 'thunderclap headache',
    ],
    breathing: [
      'can\'t breathe', 'cannot breathe', 'difficulty breathing', 'shortness of breath',
      'gasping for air', 'choking', 'turning blue', 'lips turning blue', 'severe asthma attack',
      'not breathing', 'stopped breathing',
    ],
    bleeding_trauma: [
      'severe bleeding', 'heavy bleeding', 'won\'t stop bleeding', 'wont stop bleeding',
      'accident', 'car accident', 'road accident', 'car crash', 'hit by car', 'run over',
      'fell from height', 'fall from height', 'head injury', 'severe head trauma',
      'stabbed', 'gunshot', 'gun shot', 'deep wound', 'amputation', 'severed finger',
      'compound fracture', 'bone sticking out', 'internal bleeding',
    ],
    consciousness: [
      'unconscious', 'unresponsive', 'passed out', 'fainted and not waking',
      'not waking up', 'won\'t wake up', 'seizure', 'convulsions', 'fitting',
      'coma', 'collapsed',
    ],
    poisoning_allergy: [
      'poisoning', 'overdose', 'swallowed poison', 'anaphylaxis', 'severe allergic reaction',
      'throat closing', 'throat swelling', 'face swelling and cant breathe', 'snake bite',
      'severe burns', 'electric shock', 'electrocution',
    ],
    pregnancy_emergency: [
      'labor pain', 'labour pain', 'contractions', 'water broke', 'water has broken',
      'in labor', 'in labour', 'giving birth', 'about to give birth', 'baby coming',
      'severe pregnancy bleeding', 'placental abruption', 'ectopic pregnancy pain',
      'baby not moving', 'preeclampsia', 'severe abdominal pain pregnant',
    ],
    pediatric_emergency: [
      'child not breathing', 'infant unresponsive', 'baby blue', 'baby seizure',
      'child high fever seizure', 'febrile seizure',
    ],
    suicide_self_harm: [
      'suicidal', 'want to end my life', 'self harm', 'overdosed on purpose',
    ],
  }

  // MODERATE: needs care soon, not immediately life-threatening
  const MODERATE_GROUPS = {
    infection_fever: [
      'high fever', 'fever for days', 'persistent fever', 'fever with rash', 'flu',
      'infection', 'urinary tract infection', 'uti symptoms', 'dehydration',
    ],
    injury_moderate: [
      'fracture', 'broken bone', 'sprain', 'dislocated', 'deep cut', 'cut needing stitches',
      'burn', 'minor burn', 'twisted ankle', 'fell down', 'moderate injury',
    ],
    gastro: [
      'vomiting', 'vomit', 'severe vomiting', 'diarrhea', 'severe diarrhea',
      'abdominal pain', 'stomach pain', 'appendicitis', 'food poisoning',
    ],
    pain_general: [
      'severe pain', 'unbearable pain', 'migraine', 'kidney stone pain', 'back pain severe',
      'toothache severe',
    ],
    pregnancy_moderate: [
      'mild contractions', 'spotting during pregnancy', 'morning sickness severe',
      'pregnancy nausea', 'braxton hicks',
    ],
    respiratory_moderate: [
      'persistent cough', 'cough with blood', 'wheezing', 'bronchitis',
    ],
    mental_health_moderate: [
      'panic attack', 'severe anxiety', 'depression worsening',
    ],
  }

  // LOW: self-care / routine
  const LOW_GROUPS = {
    common: [
      'cold', 'common cold', 'mild headache', 'headache', 'sore throat', 'runny nose',
      'mild cough', 'cough', 'mild fever', 'body ache', 'fatigue', 'tiredness',
      'minor rash', 'rash', 'allergy mild', 'seasonal allergy', 'indigestion', 'heartburn',
      'constipation', 'mild stomach ache', 'insomnia', 'stress', 'mild anxiety',
      'checkup', 'routine checkup', 'vaccination', 'follow up',
    ],
  }

  // ── Body map definition ────────────────────────────────────────────────────
  // Each region carries: a label, optional sub-parts (shown as chips, like the
  // reference design), the SVG shapes that make it tappable, and the phrases it
  // contributes to the triage text so that "pain" + chest reads as "chest pain".
  const BODY_REGIONS = [
    {
      id: 'head',
      label: 'Head & Face',
      subParts: ['Forehead', 'Eyes', 'Jaw / Mouth', 'Back of head'],
      shapes: [
        { t: 'ellipse', cx: 110, cy: 40, rx: 25, ry: 30 },
        { t: 'rect', x: 100, y: 68, w: 20, h: 12, rx: 5 },
      ],
      phrases: ['head'],
    },
    {
      id: 'neck',
      label: 'Neck & Throat',
      subParts: ['Front of throat', 'Side of neck', 'Back of neck'],
      shapes: [{ t: 'rect', x: 96, y: 76, w: 28, h: 14, rx: 6 }],
      phrases: ['neck', 'throat'],
    },
    {
      id: 'chest',
      label: 'Chest',
      subParts: ['Centre of chest', 'Left side', 'Right side', 'Ribs'],
      shapes: [{ t: 'rect', x: 74, y: 88, w: 72, h: 56, rx: 18 }],
      phrases: ['chest'],
    },
    {
      id: 'abdomen',
      label: 'Abdomen',
      subParts: ['Upper abdomen', 'Lower abdomen', 'Right side', 'Left side'],
      shapes: [{ t: 'rect', x: 78, y: 144, w: 64, h: 50, rx: 14 }],
      phrases: ['abdominal', 'stomach'],
    },
    {
      id: 'pelvis',
      label: 'Pelvis & Hips',
      subParts: ['Hip', 'Groin', 'Lower back'],
      shapes: [{ t: 'rect', x: 80, y: 194, w: 60, h: 36, rx: 14 }],
      phrases: ['pelvic', 'hip'],
    },
    {
      id: 'arm_left',
      label: 'Right arm (patient)',
      subParts: ['Shoulder', 'Upper arm', 'Elbow', 'Forearm', 'Hand'],
      shapes: [
        { t: 'rect', x: 50, y: 90, w: 21, h: 62, rx: 10, rot: [6, 60, 90] },
        { t: 'rect', x: 43, y: 150, w: 19, h: 58, rx: 9, rot: [6, 52, 150] },
        { t: 'ellipse', cx: 47, cy: 217, rx: 10, ry: 13 },
      ],
      phrases: ['arm'],
    },
    {
      id: 'arm_right',
      label: 'Left arm (patient)',
      subParts: ['Shoulder', 'Upper arm', 'Elbow', 'Forearm', 'Hand'],
      shapes: [
        { t: 'rect', x: 149, y: 90, w: 21, h: 62, rx: 10, rot: [-6, 160, 90] },
        { t: 'rect', x: 158, y: 150, w: 19, h: 58, rx: 9, rot: [-6, 168, 150] },
        { t: 'ellipse', cx: 173, cy: 217, rx: 10, ry: 13 },
      ],
      phrases: ['arm'],
    },
    {
      id: 'leg_left',
      label: 'Right leg (patient)',
      subParts: ['Upper leg', 'Knee', 'Lower leg', 'Ankle', 'Foot'],
      shapes: [
        { t: 'rect', x: 80, y: 228, w: 26, h: 86, rx: 13 },
        { t: 'rect', x: 82, y: 314, w: 22, h: 76, rx: 11 },
        { t: 'ellipse', cx: 93, cy: 398, rx: 13, ry: 9 },
      ],
      phrases: ['leg'],
    },
    {
      id: 'leg_right',
      label: 'Left leg (patient)',
      subParts: ['Upper leg', 'Knee', 'Lower leg', 'Ankle', 'Foot'],
      shapes: [
        { t: 'rect', x: 114, y: 228, w: 26, h: 86, rx: 13 },
        { t: 'rect', x: 116, y: 314, w: 22, h: 76, rx: 11 },
        { t: 'ellipse', cx: 127, cy: 398, rx: 13, ry: 9 },
      ],
      phrases: ['leg'],
    },
  ]

  const OTHER_REGION = {
    id: 'other',
    label: 'Not on the diagram / whole body',
    subParts: ['All over', 'Back', 'Internal', 'Not sure'],
    phrases: [],
  }

  const regionById = (id) =>
    id === 'other' ? OTHER_REGION : BODY_REGIONS.find((r) => r.id === id)

  // Region-specific care notes. General first-aid positioning only — no
  // diagnosis, no dosing. Appended after the main guidance list.
  const REGION_FIRST_AID = {
    head: [
      'Do not move the head or neck if a fall or blow to the head is suspected — steady it in the position found.',
      'Keep the person awake and still; watch for vomiting, drowsiness, or unequal pupils and report these to the dispatcher.',
    ],
    neck: [
      'Keep the neck completely still and do not let the person turn their head.',
      'If the throat is swelling or breathing is noisy, treat it as an airway emergency and say so on the call.',
    ],
    chest: [
      'Let the person rest half-sitting rather than flat — most people breathe more easily this way.',
      'Do not let them walk around or "shake it off" while waiting for help.',
    ],
    abdomen: [
      'Let the person lie down with knees bent to relax the abdominal wall.',
      'Give nothing to eat or drink in case surgery is needed.',
    ],
    pelvis: [
      'Keep the person still and lying flat; a suspected pelvic injury should not be walked on.',
      'Support the legs with rolled cloth on either side rather than strapping them.',
    ],
    arm_left: [
      'Support the arm across the chest with a sling or folded cloth; do not try to straighten it.',
      'Remove rings and watches early, before swelling sets in.',
    ],
    arm_right: [
      'Support the arm across the chest with a sling or folded cloth; do not try to straighten it.',
      'Remove rings and watches early, before swelling sets in.',
    ],
    leg_left: [
      'Keep the leg still and supported; do not let the person stand or bear weight on it.',
      'Pad either side of the limb with rolled cloth instead of trying to realign it.',
    ],
    leg_right: [
      'Keep the leg still and supported; do not let the person stand or bear weight on it.',
      'Pad either side of the limb with rolled cloth instead of trying to realign it.',
    ],
    other: [],
  }

  // ── First-aid guidance banks ───────────────────────────────────────────────
  // These are general, pre-verified, widely-published first-aid instructions
  // (the kind found in Red Cross / WHO basic first-aid guides). They describe
  // positioning, what to avoid, and when/how to get professional help — they
  // do not diagnose, dose, or prescribe treatment. Emergency entries always
  // lead with "call for help" and are supplemental to that call, never a
  // substitute for it.

  const EMERGENCY_FIRST_AID = {
    cardiac: [
      'Call 108/911 immediately — do this before anything else.',
      'Have the person sit or lie down in a comfortable, upright-leaning position and stay calm.',
      'Loosen tight clothing around the neck and chest.',
      'If they have prescribed heart medication (e.g. their own nitroglycerin) nearby, help them take it as prescribed to them — do not give anyone else\'s medication.',
      'If the person becomes unresponsive and stops breathing normally, begin CPR if trained, and follow the emergency dispatcher\'s instructions.',
    ],
    stroke: [
      'Call 108/911 immediately and note the exact time symptoms started — this is critical for treatment.',
      'Keep the person still, lying on their side if they are drowsy or vomiting, to keep the airway clear.',
      'Do not give them food, water, or medication — swallowing may be impaired.',
      'Reassure them, as stroke can be frightening and disorienting.',
      'If they become unresponsive, monitor breathing and follow dispatcher instructions.',
    ],
    breathing: [
      'Call 108/911 immediately.',
      'Help the person sit upright, leaning slightly forward — this makes breathing easier.',
      'Loosen any tight clothing around the neck and chest.',
      'If they have a prescribed rescue inhaler (e.g. for asthma), help them use it as prescribed to them.',
      'If choking on an object and the person cannot cough, speak, or breathe, perform back blows and abdominal thrusts if trained.',
      'If breathing stops, begin CPR if trained and follow dispatcher instructions.',
    ],
    bleeding_trauma: [
      'Call 108/911 immediately.',
      'Apply firm, direct pressure to the wound with a clean cloth or bandage; do not remove it if it soaks through — add more layers on top.',
      'Keep the injured area elevated above heart level if possible and there is no suspected fracture.',
      'Do not move someone with a suspected head, neck, or spinal injury unless they are in immediate danger.',
      'Keep the person warm and lying down to reduce shock.',
      'Do not give food or water in case surgery is needed.',
    ],
    consciousness: [
      'Call 108/911 immediately.',
      'If the person is breathing, place them in the recovery position (on their side) to keep the airway clear.',
      'If having a seizure, clear the area of hard or sharp objects, cushion their head, and do not hold them down or put anything in their mouth. Time the seizure.',
      'Do not give food, water, or medication.',
      'If breathing stops, begin CPR if trained.',
    ],
    poisoning_allergy: [
      'Call 108/911 immediately.',
      'For a known severe allergic reaction, help the person use their prescribed epinephrine auto-injector if they have one.',
      'For suspected poisoning, try to identify what was taken/swallowed and keep the container to show responders — do not induce vomiting unless a poison control service tells you to.',
      'For burns, cool the area with clean, cool (not ice) running water and cover loosely — do not apply creams, ice, or ointments.',
      'For electric shock, do not touch the person until the power source is confirmed off.',
      'Keep the person calm and monitor their breathing until help arrives.',
    ],
    pregnancy_emergency: [
      'Call 108/911 immediately.',
      'Help the mother into a comfortable position, lying on her left side if possible, to improve blood flow.',
      'Do not attempt to delay or hold back delivery.',
      'Keep her warm and calm, and note the time contractions or symptoms started.',
      'If bleeding is present, do not insert anything and avoid unnecessary movement.',
    ],
    pediatric_emergency: [
      'Call 108/911 immediately.',
      'If the child/infant is not breathing and you are trained, begin infant/child CPR.',
      'For a febrile seizure, lay the child on their side on a safe, flat surface, cushion the head, and do not restrain them or put anything in their mouth. Time the seizure.',
      'Do not give any medication without medical guidance.',
      'Stay with the child and keep them calm until help arrives.',
    ],
    suicide_self_harm: [
      'Call 108/911 or a local crisis line immediately — this is a medical emergency.',
      'Stay with the person; do not leave them alone.',
      'Remove access to any means of harm if you can do so safely.',
      'Listen calmly without judgment while waiting for help to arrive.',
    ],
    default: [
      'Call 108/911 immediately.',
      'Keep the person still, calm, and comfortable while waiting for help.',
      'Do not give food, water, or medication unless instructed by a dispatcher.',
      'Monitor breathing and responsiveness until paramedics arrive.',
    ],
  }

  const MODERATE_FIRST_AID = {
    infection_fever: [
      'Rest and stay well-hydrated with water or oral rehydration solution.',
      'Use a light layer of clothing/bedding — avoid heavy wrapping if feverish.',
      'Seek medical evaluation within 12–24 hours, sooner if fever is very high or a rash develops.',
      'Watch for warning signs like stiff neck, confusion, or difficulty breathing — these need immediate care.',
    ],
    injury_moderate: [
      'Rest the injured area and avoid putting weight on it if a fracture or sprain is suspected.',
      'Apply a cold pack wrapped in cloth to reduce swelling (avoid direct ice contact with skin).',
      'Elevate and, if possible, gently immobilize the area with a splint or sling until evaluated.',
      'For cuts, clean gently with water and cover with a clean dressing; seek care if it\'s deep, gaping, or won\'t stop bleeding.',
      'For minor burns, cool with clean running water for several minutes and cover loosely — do not apply ice, butter, or ointments.',
    ],
    gastro: [
      'Sip clear fluids or oral rehydration solution frequently to avoid dehydration.',
      'Rest and avoid solid or heavy foods until symptoms settle.',
      'Avoid unprescribed anti-diarrheal or anti-nausea medication without medical advice.',
      'Seek care promptly if there is blood, severe pain, high fever, or signs of dehydration (dizziness, very dark urine, no urination).',
    ],
    pain_general: [
      'Rest in a comfortable position and avoid activities that worsen the pain.',
      'Avoid taking unprescribed medication beyond standard label directions.',
      'Apply a cold or warm compress if it helps, depending on the type of pain.',
      'Seek evaluation within 12–24 hours, sooner if the pain is worsening rapidly or accompanied by other symptoms.',
    ],
    pregnancy_moderate: [
      'Rest, lying on your left side, and stay hydrated.',
      'Track any bleeding, contractions, or symptoms (frequency, amount) to report to your provider.',
      'Avoid strenuous activity until evaluated.',
      'Seek prompt care if bleeding increases, pain intensifies, or baby\'s movements decrease.',
    ],
    respiratory_moderate: [
      'Rest and stay hydrated to help loosen mucus.',
      'Sit upright rather than lying flat if coughing is severe.',
      'Avoid smoke, dust, and other irritants.',
      'Seek prompt care if you cough up blood, have chest pain, or develop shortness of breath.',
    ],
    mental_health_moderate: [
      'Move to a calm, safe space and focus on slow, steady breathing.',
      'Avoid caffeine, alcohol, or stimulants until symptoms settle.',
      'Reach out to a trusted person to stay with you if possible.',
      'Seek prompt professional support — this is treatable and help is available.',
    ],
    default: [
      'Rest and monitor your condition closely.',
      'Avoid unprescribed medication without medical advice.',
      'Seek medical evaluation within 12–24 hours.',
      'Escalate to Emergency care immediately if symptoms suddenly worsen.',
    ],
  }

  const LOW_FIRST_AID = [
    'Rest and monitor your condition for changes.',
    'Stay hydrated and maintain routine self-care.',
    'Over-the-counter remedies may help; consult a pharmacist if unsure.',
    'See a doctor if symptoms persist beyond a few days or worsen.',
  ]

  // Returns the matched group key (e.g. 'cardiac'), or null if no match.
  function findMatchedGroup(text, groups) {
    for (const key in groups) {
      for (const phrase of groups[key]) {
        if (text.includes(phrase)) return key
      }
    }
    return null
  }

  // Combines the typed symptoms with the tapped body region so that a vague
  // "sharp pain, can't move" plus a chest tap is read as "chest pain".
  // This can only ADD phrases, so it can raise urgency but never lower it.
  function buildTriageText() {
    const base = symptoms.toLowerCase()
    const r = region ? regionById(region) : null
    if (!r) return base

    const extras = []
    const descriptors = ['pain', 'ache', 'hurt', 'bleeding', 'swelling', 'numb', 'burn', 'injury', 'cut']
    const hasDescriptor = descriptors.some((d) => base.includes(d))

    r.phrases.forEach((p) => {
      extras.push(p)
      if (hasDescriptor) extras.push(`${p} pain`)
    })
    if (subPart) extras.push(subPart.toLowerCase())

    return `${base} ${extras.join(' ')}`.trim()
  }

  // ── Ambulance connectivity ────────────────────────────────────────────────
  // Dial-out targets. 108 is the state ambulance service in most of India,
  // 112 is the single national emergency number, 102 is the maternity/infant
  // ambulance line. Adjust or make these configurable per deployment region.
  const AMBULANCE_LINES = [
    { number: '108', label: 'Ambulance (108)', note: 'Emergency response service' },
    { number: '112', label: 'All emergencies (112)', note: 'Police, fire, medical' },
    { number: '102', label: 'Mother & child (102)', note: 'Pregnancy and infant transport' },
  ]

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('This device can\'t share location. Read out the nearest landmark instead.')
      return
    }
    setGeoStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
        setGeoStatus('')
      },
      (err) => {
        setGeoStatus(
          err.code === err.PERMISSION_DENIED
            ? 'Location was blocked. Allow it in browser settings, or read out the nearest landmark.'
            : 'Couldn\'t get a location fix. Read out the nearest landmark instead.'
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const mapsLink = geo ? `https://maps.google.com/?q=${geo.lat},${geo.lng}` : ''

  // A plain-text block the caller can read out or send ahead to the crew.
  const buildHandoverSummary = (urgency) => {
    const r = region ? regionById(region) : null
    const lines = [
      `MEDICAL — ${urgency ? urgency.toUpperCase() : 'ASSESSMENT'}`,
      `Reported: ${symptoms.trim() || 'not described'}`,
      r ? `Location on body: ${r.label}${subPart ? ` (${subPart})` : ''}` : null,
      age ? `Age: ${age}` : null,
      geo ? `Position: ${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)} (±${geo.accuracy}m) — ${mapsLink}` : 'Position: not shared',
      photos.length ? `${photos.length} photo(s) on this phone to show the crew` : null,
      `Logged at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    ]
    return lines.filter(Boolean).join('\n')
  }

  const copyText = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  // ── Camera ────────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCamOpen(false)
  }, [])

  useEffect(() => stopCamera, [stopCamera])

  const openCamera = async () => {
    setCamError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError('This browser can\'t open the camera here. Use "Upload photo" instead.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = stream
      setCamOpen(true)
      // videoRef is mounted on the next paint
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      }, 0)
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'
          ? 'Camera access was blocked. Allow it in your browser settings, or use "Upload photo".'
          : err.name === 'NotFoundError'
          ? 'No camera found on this device. Use "Upload photo" instead.'
          : 'Camera couldn\'t start. Use "Upload photo" instead.'
      setCamError(msg)
    }
  }

  const addPhoto = (dataUrl) => {
    setPhotos((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        dataUrl,
        label: region ? regionById(region).label : 'Condition',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ].slice(0, 4))
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const maxW = 900
    const scale = Math.min(1, maxW / video.videoWidth)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    addPhoto(canvas.toDataURL('image/jpeg', 0.75))
    if (photos.length + 1 >= 4) stopCamera()
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => addPhoto(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const removePhoto = (id) => setPhotos((p) => p.filter((x) => x.id !== id))

  // ── Evaluate ──────────────────────────────────────────────────────────────
  const handleEvaluate = (e) => {
    e.preventDefault()
    if (!symptoms.trim() && !region) return

    stopCamera()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const text = buildTriageText()

      let urgency = 'Low'
      let matchedGroup = null

      // Check most severe first — Emergency overrides everything
      const emergencyMatch = findMatchedGroup(text, EMERGENCY_GROUPS)
      const moderateMatch = findMatchedGroup(text, MODERATE_GROUPS)
      const lowMatch = findMatchedGroup(text, LOW_GROUPS)

      if (emergencyMatch) {
        urgency = 'Emergency'
        matchedGroup = emergencyMatch
      } else if (moderateMatch) {
        urgency = 'Moderate'
        matchedGroup = moderateMatch
      } else if (lowMatch) {
        urgency = 'Low'
        matchedGroup = lowMatch
      } else {
        // Fallback: unrecognized symptom text — err on the side of caution
        // and route to Moderate rather than silently defaulting to Low.
        urgency = 'Moderate'
        matchedGroup = 'default'
      }

      let guidance
      if (urgency === 'Emergency') {
        guidance = EMERGENCY_FIRST_AID[matchedGroup] || EMERGENCY_FIRST_AID.default
      } else if (urgency === 'Moderate') {
        guidance = MODERATE_FIRST_AID[matchedGroup] || MODERATE_FIRST_AID.default
      } else {
        guidance = LOW_FIRST_AID
      }

      const regionSteps = region ? (REGION_FIRST_AID[region] || []) : []

      setResult({ urgency, matchedGroup, guidance, regionSteps, region, subPart })
    }, 800)
  }

  const resetAll = () => {
    setResult(null)
    setRegion(null)
    setSubPart(null)
    setGeo(null)
    setGeoStatus('')
    setCalled(null)
  }

  // ── Body map rendering ────────────────────────────────────────────────────
  const shapeFill = (id) => (region === id ? '#ef4444' : '#cbd5e1')
  const shapeProps = (id) => ({
    fill: shapeFill(id),
    stroke: region === id ? '#b91c1c' : '#94a3b8',
    strokeWidth: 1,
    style: { cursor: 'pointer', transition: 'fill .15s ease' },
  })

  const renderShape = (shape, r, i) => {
    const common = { key: `${r.id}-${i}`, ...shapeProps(r.id) }
    const transform = shape.rot ? `rotate(${shape.rot[0]} ${shape.rot[1]} ${shape.rot[2]})` : undefined
    if (shape.t === 'ellipse') {
      return <ellipse {...common} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} transform={transform} />
    }
    return (
      <rect {...common} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} transform={transform} />
    )
  }

  const selectedRegion = region ? regionById(region) : null

  const chipStyle = (active) => ({
    padding: '7px 14px',
    borderRadius: 999,
    border: active ? '1.5px solid #0f7a74' : '1.5px solid #e2e8f0',
    background: active ? '#d8f3f1' : '#fff',
    color: active ? '#0f7a74' : '#64748b',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  })

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: '#f8fafb' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', padding: 28, borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
          🩺 AI Emergency Triage &amp; Symptom Guidance
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>
          Describe symptoms below to determine appropriate medical urgency levels.
        </p>

        <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Symptoms
            </label>
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Sudden severe chest pain, shortness of breath, persistent high fever..."
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fafafa', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          {/* ── Body map ──────────────────────────────────────────────── */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 18, background: '#fafcfc' }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Where exactly is the pain or issue located?
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px' }}>
              Tap the area on the body. Left and right are from the patient's own point of view.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 220 420" style={{ width: '100%', maxWidth: 230, height: 'auto' }} role="group" aria-label="Body region selector">
                <ellipse cx="110" cy="410" rx="62" ry="8" fill="#e2e8f0" opacity="0.7" />
                {BODY_REGIONS.map((r) => (
                  <g
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    aria-label={r.label}
                    aria-pressed={region === r.id}
                    onClick={() => { setRegion(r.id); setSubPart(null) }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setRegion(r.id)
                        setSubPart(null)
                      }
                    }}
                  >
                    {r.shapes.map((s, i) => renderShape(s, r, i))}
                  </g>
                ))}
              </svg>
            </div>

            {/* Sub-part chips */}
            {selectedRegion && (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                  {selectedRegion.label} — narrow it down
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedRegion.subParts.map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setSubPart(subPart === sp ? null : sp)}
                      style={chipStyle(subPart === sp)}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setRegion('other'); setSubPart(null) }}
                style={chipStyle(region === 'other')}
              >
                Not on the diagram
              </button>
              {region && (
                <button
                  type="button"
                  onClick={() => { setRegion(null); setSubPart(null) }}
                  style={{ ...chipStyle(false), color: '#94a3b8' }}
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>

          {/* ── Camera capture ────────────────────────────────────────── */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 18, background: '#fafcfc' }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Photograph the affected area
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px', lineHeight: 1.5 }}>
              Photos are saved on this device only, so you can show them to the paramedic or doctor. They are not analysed here and do not change the urgency level. Never delay calling for help to take a photo.
            </p>

            {camOpen ? (
              <div>
                <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#0f172a' }}>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #1d9e97, #0f7a74)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Take photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    style={{ padding: '11px 18px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Close camera
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={openCamera}
                  disabled={photos.length >= 4}
                  style={{ padding: '11px 18px', borderRadius: 12, border: '1.5px solid #0f7a74', background: '#fff', color: '#0f7a74', fontSize: 13, fontWeight: 700, cursor: photos.length >= 4 ? 'not-allowed' : 'pointer', opacity: photos.length >= 4 ? 0.5 : 1 }}
                >
                  📷 Open camera
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={photos.length >= 4}
                  style={{ padding: '11px 18px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: photos.length >= 4 ? 'not-allowed' : 'pointer', opacity: photos.length >= 4 ? 0.5 : 1 }}
                >
                  Upload photo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFile}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            {camError && (
              <p style={{ fontSize: 12, color: '#b91c1c', margin: '10px 0 0' }}>{camError}</p>
            )}

            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                {photos.map((p) => (
                  <div key={p.id} style={{ position: 'relative', width: 86 }}>
                    <img
                      src={p.dataUrl}
                      alt={`${p.label} at ${p.time}`}
                      style={{ width: 86, height: 86, objectFit: 'cover', borderRadius: 12, border: '1.5px solid #e2e8f0' }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(p.id)}
                      aria-label="Remove photo"
                      style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, border: 'none', background: '#0f172a', color: '#fff', fontSize: 12, lineHeight: 1, cursor: 'pointer' }}
                    >
                      ×
                    </button>
                    <span style={{ display: 'block', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{p.time}</span>
                  </div>
                ))}
              </div>
            )}
            {photos.length >= 4 && (
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '10px 0 0' }}>Four photos is the limit — remove one to add another.</p>
            )}
          </div>

          <div style={{ width: '40%' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Patient Age (Optional)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 35"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fafafa', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '14px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #1d9e97, #0f7a74)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(29,158,151,0.3)' }}
          >
            {loading ? 'Evaluating Symptoms...' : 'Analyze Urgency'}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: 28 }}>
            {/* 🔴 RED — Emergency */}
            {result.urgency === 'Emergency' && (
              <div style={{ background: '#ef4444', color: '#fff', padding: 24, borderRadius: 18, border: '2px solid #dc2626', boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 12 }}>
                    Urgency Badge
                  </span>
                  <span style={{ fontSize: 24 }}>🚨</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 6px' }}>🔴 RED — Emergency</h3>
                <p style={{ fontSize: 13, color: '#fef2f2', margin: '0 0 18px', lineHeight: 1.5 }}>
                  Urgent medical intervention required (e.g., chest pain, stroke symptoms, severe bleeding). Call for help immediately — first-aid steps below are meant to support you until paramedics arrive, not replace them.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <a
                    href="tel:108"
                    style={{ textDecoration: 'none', background: '#fff', color: '#dc2626', padding: '12px 0', borderRadius: 12, textAlign: 'center', fontWeight: 800, fontSize: 13, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  >
                    📞 Call 108 / 911
                  </a>
                  <button
                    onClick={() => onNavigate('facility')}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '12px 0', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                  >
                    📍 Locate Emergency Room
                  </button>
                </div>
              </div>
            )}

            {/* 🟡 YELLOW — Moderate / Urgent */}
            {result.urgency === 'Moderate' && (
              <div style={{ background: '#f59e0b', color: '#fff', padding: 24, borderRadius: 18, border: '2px solid #d97706', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 12 }}>
                    Urgency Badge
                  </span>
                  <span style={{ fontSize: 24 }}>⚠️</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 6px' }}>🟡 YELLOW — Moderate / Urgent</h3>
                <p style={{ fontSize: 13, color: '#fffbeb', margin: '0 0 18px', lineHeight: 1.5 }}>
                  Requires medical evaluation within 12–24 hours (e.g., high persistent fever, deep cut requiring sutures, mild fracture suspicion).
                </p>
                <button
                  onClick={() => onNavigate('bookslot')}
                  style={{ width: '100%', background: '#fff', color: '#b45309', border: 'none', padding: '12px 0', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  📅 Book Appointment
                </button>
              </div>
            )}

            {/* 🟢 GREEN — Low / Non-Urgent */}
            {result.urgency === 'Low' && (
              <div style={{ background: '#10b981', color: '#fff', padding: 24, borderRadius: 18, border: '2px solid #059669', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 12 }}>
                    Urgency Badge
                  </span>
                  <span style={{ fontSize: 24 }}>🟢</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 6px' }}>🟢 GREEN — Low / Non-Urgent</h3>
                <p style={{ fontSize: 13, color: '#ecfdf5', margin: '0 0 18px', lineHeight: 1.5 }}>
                  Self-care or primary care routine visit (e.g., common cold, mild headache, minor skin rash).
                </p>
                <button
                  onClick={() => onNavigate('bookslot')}
                  style={{ width: '100%', background: '#fff', color: '#047857', border: 'none', padding: '12px 0', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  📅 Book Appointment
                </button>
              </div>
            )}

            {/* 🚑 Ambulance connectivity */}
            {result.urgency !== 'Low' && (
              <div
                style={{
                  marginTop: 18,
                  background: '#fff',
                  border: result.urgency === 'Emergency' ? '2px solid #fecaca' : '1.5px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  🚑 {result.urgency === 'Emergency' ? 'Get an ambulance now' : 'Arrange transport'}
                </h4>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>
                  {result.urgency === 'Emergency'
                    ? 'Call first, then share the location. Stay on the line with the dispatcher — they will guide you through the steps below.'
                    : 'Not an emergency call, but if the patient can\'t travel safely, book an ambulance or a taxi rather than driving yourself.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {AMBULANCE_LINES.map((line) => (
                    <a
                      key={line.number}
                      href={`tel:${line.number}`}
                      onClick={() => setCalled(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textDecoration: 'none',
                        padding: '13px 16px',
                        borderRadius: 12,
                        background: line.number === '108' ? '#dc2626' : '#fff',
                        color: line.number === '108' ? '#fff' : '#0f172a',
                        border: line.number === '108' ? 'none' : '1.5px solid #e2e8f0',
                        boxShadow: line.number === '108' ? '0 4px 14px rgba(220,38,38,0.25)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{line.label}</span>
                      <span style={{ fontSize: 11, opacity: 0.85 }}>{line.note}</span>
                    </a>
                  ))}
                </div>

                {called && (
                  <p style={{ fontSize: 12, color: '#0f7a74', fontWeight: 700, margin: '10px 0 0' }}>
                    Call placed at {called}. Keep this screen open for the crew.
                  </p>
                )}

                {/* Pickup location */}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <h5 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Pickup location</h5>
                  {geo ? (
                    <div>
                      <p style={{ fontSize: 13, color: '#334155', margin: '0 0 4px', fontWeight: 700 }}>
                        {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}
                      </p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 10px' }}>
                        Accurate to about {geo.accuracy} m · fixed at {geo.time}. Read the coordinates out, and add the building name and floor — a pin alone won't get them to the door.
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <a
                          href={mapsLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ ...chipStyle(false), textDecoration: 'none', display: 'inline-block' }}
                        >
                          Open in Maps
                        </a>
                        <button type="button" onClick={() => copyText(mapsLink, 'loc')} style={chipStyle(copied === 'loc')}>
                          {copied === 'loc' ? 'Link copied' : 'Copy map link'}
                        </button>
                        <a
                          href={`sms:?&body=${encodeURIComponent(buildHandoverSummary(result.urgency))}`}
                          style={{ ...chipStyle(false), textDecoration: 'none', display: 'inline-block' }}
                        >
                          Text it to someone
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={requestLocation}
                        disabled={geoStatus === 'locating'}
                        style={{ padding: '11px 18px', borderRadius: 12, border: '1.5px solid #0f7a74', background: '#fff', color: '#0f7a74', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      >
                        {geoStatus === 'locating' ? 'Finding location…' : '📍 Share pickup location'}
                      </button>
                      {geoStatus && geoStatus !== 'locating' && (
                        <p style={{ fontSize: 12, color: '#b91c1c', margin: '10px 0 0' }}>{geoStatus}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Handover summary */}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <h5 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>What to tell the crew</h5>
                  <pre style={{ margin: '0 0 10px', padding: 12, background: '#f8fafc', borderRadius: 10, fontSize: 12, color: '#475569', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.6 }}>
                    {buildHandoverSummary(result.urgency)}
                  </pre>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => copyText(buildHandoverSummary(result.urgency), 'sum')}
                      style={chipStyle(copied === 'sum')}
                    >
                      {copied === 'sum' ? 'Copied' : 'Copy summary'}
                    </button>
                    <button type="button" onClick={() => onNavigate('facility')} style={chipStyle(false)}>
                      Nearest hospitals
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 18, background: '#f1f5f9', padding: 18, borderRadius: 14 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
                {result.urgency === 'Emergency' ? 'First-Aid Steps While Help Is On The Way' : 'Recommended Steps'}
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.guidance.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>

              {result.regionSteps.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
                    Caring for the {regionById(result.region).label.toLowerCase()}
                    {result.subPart ? ` (${result.subPart.toLowerCase()})` : ''}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.regionSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {photos.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    Photos to show the responder
                  </h4>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 10px' }}>
                    {photos.length} photo{photos.length > 1 ? 's' : ''} captured
                    {result.region ? ` · ${regionById(result.region).label}` : ''}. Hand the phone over rather than describing from memory.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {photos.map((p) => (
                      <img
                        key={p.id}
                        src={p.dataUrl}
                        alt={`${p.label} at ${p.time}`}
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, border: '1px solid #e2e8f0' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <p style={{ fontSize: 11, color: '#94a3b8', margin: '14px 0 0', lineHeight: 1.5 }}>
                This guidance is general first-aid information, not a diagnosis or treatment plan. It does not replace professional medical care.
              </p>

              <button
                type="button"
                onClick={resetAll}
                style={{ marginTop: 14, padding: '9px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Start a new assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}