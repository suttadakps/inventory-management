import { useLanguage } from "./language-context";

export const translations = {
  en: {
    nav: {
      about: "About",
      services: "Services",
      portfolio: "Portfolio",
      contact: "Contact",
      refer: "Refer a Project",
      referShort: "Refer",
    },
    hero: {
      eyebrow: "Construction · Renovation · Interior Fit-Out",
      title: "Building the Next Verge",
      subtitle:
        "We combine over 40 years of construction and renovation experience with modern design thinking to deliver spaces that are functional, beautiful, and built to last.",
      ctaWork: "View Our Work",
      ctaContact: "Get in Touch",
    },
    about: {
      eyebrow: "About Us",
      title: "Building Trust Through Experience",
      paragraphs: [
        "At Artiverges Next, we combine over 40 years of construction and renovation experience with modern design thinking to deliver spaces that are functional, beautiful, and built to last.",
        "Founded by a new generation of creative professionals and supported by a construction team with decades of hands-on expertise, we specialize in construction, renovation, interior fit-out, and custom-built solutions for residential, commercial, hospitality, and retail projects.",
        "Our strength lies in understanding both design and execution. From concept development and budgeting to construction management and project delivery, we ensure every detail is carefully planned and professionally executed.",
        "We believe every space should reflect its purpose, enhance productivity, and create meaningful experiences for the people who use it.",
      ],
    },
    why: {
      eyebrow: "Why Choose Us",
      title: "Over 40 years of combined expertise, on every project",
      intro:
        "Our team of engineers, craftsmen, and designers listens closely at every stage — from initial consultation to on-site evaluation — tailoring our approach to elevate the way you live and work.",
      points: [
        {
          title: "One-Stop, Hassle-Free Service",
          description:
            "From concept to construction, we offer a fully integrated design and build solution — one dedicated team, start to finish.",
        },
        {
          title: "Spaces Designed to Enhance Productivity",
          description:
            "Every layout is planned around how you actually live and work, not just how it looks.",
        },
        {
          title: "Meticulous Attention to Detail",
          description:
            "From material selection to final styling, every phase is carefully planned and professionally executed.",
        },
        {
          title: "Professional Team, Dedicated Support",
          description:
            "Continuous client support and after-sales service for confidence before, during, and after project completion.",
        },
      ],
    },
    services: {
      eyebrow: "What We Do",
      title: "Services built around one team, end to end",
      items: [
        {
          title: "Construction",
          description:
            "Comprehensive construction services for residential, commercial, hospitality, and retail projects. From structural works to final finishes, we deliver projects with precision, quality, and attention to detail.",
        },
        {
          title: "Renovation & Remodeling",
          description:
            "Revitalize existing spaces through strategic renovation solutions. Whether upgrading interiors, modernizing facilities, or transforming outdated properties, we create environments that meet evolving needs.",
        },
        {
          title: "Interior Design & Fit-Out",
          description:
            "Creative and functional interior solutions tailored to each client's vision. We specialize in retail stores, offices, restaurants, cafes, hotels, condominiums, and residential projects.",
        },
        {
          title: "Design & Build",
          description:
            "A complete project delivery approach that integrates design, budgeting, construction, and project management under one team, ensuring efficiency, consistency, and cost control.",
        },
        {
          title: "Project Management",
          description:
            "Professional planning, coordination, and site supervision to ensure every project is delivered on schedule, within budget, and to the highest quality standards.",
        },
        {
          title: "Custom Built Solutions",
          description:
            "Bespoke furniture, feature walls, display systems, counters, and specialized interior elements designed and built to fit unique project requirements.",
        },
      ],
      capabilitiesTitle: "Construction Capabilities",
      capabilities: [
        "Renovation",
        "Partitioning",
        "Painting",
        "Ceiling",
        "Glass",
        "Stainless Steel",
        "Structure Demolition",
        "Maintenance",
        "Flooring & Tiling",
      ],
    },
    process: {
      eyebrow: "How We Work",
      title: "Five steps, one dedicated team",
      steps: [
        {
          title: "Consult & Site Visit",
          description:
            "On-site visit to measure actual space, and gather your lifestyle preferences and budget requirements.",
        },
        {
          title: "Design Presentation",
          description:
            "Moodboard, layout, and 3D perspectives for material selection and atmosphere approval.",
        },
        {
          title: "Estimate & BOQ",
          description:
            "A clear cost summary and detailed Bill of Quantities, with flexible adjustments to match your budget.",
        },
        {
          title: "Construction Begins",
          description:
            "Construction proceeds with continuous updates via a real-time project tracking system.",
        },
        {
          title: "Handover & Styling",
          description:
            "Final styling and furnishing before move-in, with a thorough quality inspection.",
        },
      ],
    },
    turnkey: {
      eyebrow: "Artiverges Next",
      title: "Full construction turnkey service",
      body: "From concept to completion, we deliver architecture, interior fit-out, renovation, and construction with precision, transparency, and craftsmanship. Every project is managed end-to-end by one dedicated team.",
    },
    portfolio: {
      eyebrow: "Project Portfolio",
      title: "A selection of recent work",
      subtitle: "Tap any project to see the full scope of work.",
      viewDetails: "View Details",
      renderBadge: "3D Visualization",
      viewMore: "View More Work",
    },
    contact: {
      eyebrow: "Get in Touch",
      title: "Let's build your next project",
      body: "Tell us about your space and we'll get back to you to schedule a site visit and consultation.",
      copyright: "© {year} Artiverges Next. All rights reserved.",
      staffLogin: "Staff Login",
    },
    refer: {
      eyebrow: "Refer a Project",
      title: "Refer a Project to Us",
      body: "If you know someone looking for a construction, renovation, or interior fit-out contractor, refer them to Artiverges Next here. Our team will follow up and coordinate every step.",
    },
    referralForm: {
      referrerName: "Referrer Name / Partner *",
      referrerContact: "Contact Info (Phone/Email/LINE)",
      projectTitle: "Project Referred *",
      prospectName: "Prospect's Name (optional)",
      budget: "Estimated Budget (THB)",
      details: "Additional Details",
      errorReferrerName: "Please enter the referrer's name",
      errorProjectTitle: "Please enter the project referred",
      successTitle: "Thank You for Your Referral",
      successBody:
        "Our team has received your submission and will get back to you as soon as possible.",
      submit: "Submit Referral",
      submitting: "Submitting...",
    },
  },
  th: {
    nav: {
      about: "เกี่ยวกับเรา",
      services: "บริการ",
      portfolio: "ผลงาน",
      contact: "ติดต่อเรา",
      refer: "แนะนำงาน",
      referShort: "แนะนำงาน",
    },
    hero: {
      eyebrow: "ก่อสร้าง · รีโนเวท · ตกแต่งภายใน",
      title: "Building the Next Verge",
      subtitle:
        "เรารวมประสบการณ์ด้านการก่อสร้างและรีโนเวทกว่า 40 ปี เข้ากับแนวคิดการออกแบบสมัยใหม่ เพื่อสร้างสรรค์พื้นที่ที่ใช้งานได้จริง สวยงาม และคงทนยาวนาน",
      ctaWork: "ดูผลงานของเรา",
      ctaContact: "ติดต่อเรา",
    },
    about: {
      eyebrow: "เกี่ยวกับเรา",
      title: "สร้างความเชื่อมั่นด้วยประสบการณ์",
      paragraphs: [
        "ที่ Artiverges Next เรารวมประสบการณ์ด้านการก่อสร้างและรีโนเวทกว่า 40 ปี เข้ากับแนวคิดการออกแบบสมัยใหม่ เพื่อสร้างสรรค์พื้นที่ที่ใช้งานได้จริง สวยงาม และคงทนยาวนาน",
        "ก่อตั้งโดยคนรุ่นใหม่ที่มีความคิดสร้างสรรค์ และได้รับการสนับสนุนจากทีมช่างก่อสร้างที่มีความเชี่ยวชาญมายาวนาน เราเชี่ยวชาญด้านงานก่อสร้าง รีโนเวท ตกแต่งภายใน และงานสั่งทำพิเศษ สำหรับโครงการที่พักอาศัย เชิงพาณิชย์ โรงแรม และร้านค้าปลีก",
        "จุดแข็งของเราคือความเข้าใจทั้งด้านการออกแบบและการก่อสร้าง ตั้งแต่การพัฒนาคอนเซ็ปต์ การจัดทำงบประมาณ ไปจนถึงการบริหารจัดการก่อสร้างและการส่งมอบโครงการ เราดูแลทุกรายละเอียดอย่างพิถีพิถันและมีความเป็นมืออาชีพ",
        "เราเชื่อว่าทุกพื้นที่ควรสะท้อนถึงจุดประสงค์การใช้งาน เสริมสร้างประสิทธิภาพการทำงาน และสร้างประสบการณ์ที่มีความหมายให้กับผู้ใช้งาน",
      ],
    },
    why: {
      eyebrow: "ทำไมต้องเลือกเรา",
      title: "ประสบการณ์รวมกว่า 40 ปี ในทุกโครงการ",
      intro:
        "ทีมวิศวกร ช่างฝีมือ และนักออกแบบของเรารับฟังอย่างใกล้ชิดในทุกขั้นตอน ตั้งแต่การให้คำปรึกษาเบื้องต้นไปจนถึงการประเมินหน้างาน เพื่อปรับแนวทางให้เหมาะกับการใช้ชีวิตและการทำงานของคุณ",
      points: [
        {
          title: "บริการครบวงจร ไม่ยุ่งยาก",
          description:
            "ตั้งแต่แนวคิดจนถึงการก่อสร้าง เรามีโซลูชันออกแบบและก่อสร้างแบบครบวงจร โดยทีมงานเดียวกันตั้งแต่ต้นจนจบ",
        },
        {
          title: "พื้นที่ที่ออกแบบเพื่อเพิ่มประสิทธิภาพ",
          description:
            "ทุกผังพื้นที่ถูกวางแผนตามการใช้ชีวิตและการทำงานจริงของคุณ ไม่ใช่แค่ความสวยงามภายนอก",
        },
        {
          title: "ใส่ใจในรายละเอียดอย่างพิถีพิถัน",
          description:
            "ตั้งแต่การเลือกวัสดุไปจนถึงการตกแต่งขั้นสุดท้าย ทุกขั้นตอนถูกวางแผนและดำเนินการอย่างมืออาชีพ",
        },
        {
          title: "ทีมงานมืออาชีพ พร้อมดูแลตลอด",
          description:
            "การสนับสนุนลูกค้าอย่างต่อเนื่องและบริการหลังการขาย เพื่อความมั่นใจทั้งก่อน ระหว่าง และหลังโครงการแล้วเสร็จ",
        },
      ],
    },
    services: {
      eyebrow: "บริการของเรา",
      title: "บริการครบวงจร ดูแลโดยทีมงานเดียว",
      items: [
        {
          title: "งานก่อสร้าง",
          description:
            "บริการก่อสร้างครบวงจรสำหรับโครงการที่พักอาศัย เชิงพาณิชย์ โรงแรม และร้านค้าปลีก ตั้งแต่งานโครงสร้างจนถึงงานตกแต่งขั้นสุดท้าย เราส่งมอบงานด้วยความแม่นยำ คุณภาพ และใส่ใจในทุกรายละเอียด",
        },
        {
          title: "รีโนเวทและปรับปรุงพื้นที่",
          description:
            "ฟื้นฟูพื้นที่เดิมด้วยโซลูชันการรีโนเวทเชิงกลยุทธ์ ไม่ว่าจะเป็นการอัปเกรดภายใน ปรับปรุงสิ่งอำนวยความสะดวก หรือเปลี่ยนโฉมอสังหาริมทรัพย์เก่า เราสร้างสรรค์สภาพแวดล้อมที่ตอบโจทย์ความต้องการที่เปลี่ยนแปลงไป",
        },
        {
          title: "ออกแบบและตกแต่งภายใน",
          description:
            "โซลูชันตกแต่งภายในที่สร้างสรรค์และใช้งานได้จริง ปรับให้เหมาะกับวิสัยทัศน์ของลูกค้าแต่ละราย เราเชี่ยวชาญด้านร้านค้าปลีก สำนักงาน ร้านอาหาร คาเฟ่ โรงแรม คอนโดมิเนียม และที่พักอาศัย",
        },
        {
          title: "ออกแบบและก่อสร้าง",
          description:
            "แนวทางการส่งมอบโครงการแบบครบวงจร ผสานงานออกแบบ งบประมาณ การก่อสร้าง และการบริหารโครงการไว้ในทีมเดียว เพื่อความมีประสิทธิภาพ ความสม่ำเสมอ และการควบคุมต้นทุน",
        },
        {
          title: "บริหารจัดการโครงการ",
          description:
            "การวางแผน ประสานงาน และควบคุมงานหน้าไซต์อย่างมืออาชีพ เพื่อให้ทุกโครงการแล้วเสร็จตรงเวลา อยู่ในงบประมาณ และได้มาตรฐานคุณภาพสูงสุด",
        },
        {
          title: "งานสั่งทำพิเศษ",
          description:
            "เฟอร์นิเจอร์ กำแพงตกแต่ง ระบบดิสเพลย์ เคาน์เตอร์ และองค์ประกอบตกแต่งภายในพิเศษ ออกแบบและผลิตให้ตรงตามความต้องการเฉพาะของแต่ละโครงการ",
        },
      ],
      capabilitiesTitle: "ความสามารถด้านงานก่อสร้าง",
      capabilities: [
        "รีโนเวท",
        "งานผนังกั้นห้อง",
        "งานสี",
        "งานฝ้าเพดาน",
        "งานกระจก",
        "งานสเตนเลส",
        "งานรื้อถอนโครงสร้าง",
        "งานซ่อมบำรุง",
        "งานพื้นและกระเบื้อง",
      ],
    },
    process: {
      eyebrow: "ขั้นตอนการทำงาน",
      title: "5 ขั้นตอน ดูแลโดยทีมงานเดียว",
      steps: [
        {
          title: "ให้คำปรึกษาและลงพื้นที่",
          description:
            "ลงพื้นที่จริงเพื่อวัดขนาดพื้นที่ พร้อมรับฟังไลฟ์สไตล์และงบประมาณของคุณ",
        },
        {
          title: "นำเสนอแบบดีไซน์",
          description:
            "นำเสนอมู้ดบอร์ด ผังพื้นที่ และภาพ 3 มิติ เพื่อเลือกวัสดุและอนุมัติบรรยากาศโดยรวม",
        },
        {
          title: "ประเมินราคาและจัดทำ BOQ",
          description:
            "สรุปค่าใช้จ่ายที่ชัดเจนพร้อมรายการประมาณราคา (BOQ) ปรับเปลี่ยนได้ยืดหยุ่นตามงบประมาณ",
        },
        {
          title: "เริ่มงานก่อสร้าง",
          description:
            "ดำเนินการก่อสร้างพร้อมอัปเดตความคืบหน้าแบบเรียลไทม์ผ่านระบบติดตามโครงการ",
        },
        {
          title: "ส่งมอบงานและตกแต่ง",
          description:
            "ตกแต่งและจัดวางเฟอร์นิเจอร์ขั้นสุดท้ายก่อนเข้าอยู่ พร้อมตรวจสอบคุณภาพอย่างละเอียด",
        },
      ],
    },
    turnkey: {
      eyebrow: "Artiverges Next",
      title: "บริการก่อสร้างครบวงจรแบบเทิร์นคีย์",
      body: "ตั้งแต่แนวคิดจนถึงงานแล้วเสร็จ เราส่งมอบงานสถาปัตยกรรม ตกแต่งภายใน รีโนเวท และก่อสร้าง ด้วยความแม่นยำ โปร่งใส และฝีมือประณีต ทุกโครงการบริหารจัดการแบบครบวงจรโดยทีมงานเดียว",
    },
    portfolio: {
      eyebrow: "ผลงานของเรา",
      title: "ผลงานคัดสรรล่าสุด",
      subtitle: "แตะที่โครงการเพื่อดูรายละเอียดขอบเขตงานทั้งหมด",
      viewDetails: "ดูรายละเอียด",
      renderBadge: "ภาพจำลอง 3 มิติ",
      viewMore: "ดูผลงานเพิ่มเติม",
    },
    contact: {
      eyebrow: "ติดต่อเรา",
      title: "มาสร้างโครงการต่อไปของคุณด้วยกัน",
      body: "บอกเราเกี่ยวกับพื้นที่ของคุณ แล้วทีมงานจะติดต่อกลับเพื่อนัดหมายลงพื้นที่และให้คำปรึกษา",
      copyright: "© {year} Artiverges Next สงวนลิขสิทธิ์",
      staffLogin: "เข้าสู่ระบบพนักงาน",
    },
    refer: {
      eyebrow: "แนะนำงาน",
      title: "แนะนำงานให้เรา",
      body: "หากคุณรู้จักใครที่กำลังมองหาผู้รับเหมาก่อสร้าง รีโนเวท หรือตกแต่งภายใน แนะนำงานให้ Artiverges Next ได้ที่นี่ ทีมงานของเราจะติดต่อกลับ และประสานงานทุกขั้นตอน",
    },
    referralForm: {
      referrerName: "ชื่อผู้แนะนำ / พาร์ทเนอร์ *",
      referrerContact: "ช่องทางติดต่อ (เบอร์/อีเมล/LINE)",
      projectTitle: "งานที่แนะนำ *",
      prospectName: "ชื่อลูกค้าที่แนะนำ (ถ้ามี)",
      budget: "งบประมาณโดยประมาณ (บาท)",
      details: "รายละเอียดเพิ่มเติม",
      errorReferrerName: "กรุณากรอกชื่อผู้แนะนำ",
      errorProjectTitle: "กรุณากรอกงานที่แนะนำ",
      successTitle: "ขอบคุณสำหรับการแนะนำ",
      successBody: "ทีมงานของเราได้รับข้อมูลแล้ว และจะติดต่อกลับโดยเร็วที่สุด",
      submit: "ส่งการแนะนำ",
      submitting: "กำลังส่งข้อมูล...",
    },
  },
  zh: {
    nav: {
      about: "关于我们",
      services: "服务项目",
      portfolio: "作品集",
      contact: "联系我们",
      refer: "推荐项目",
      referShort: "推荐",
    },
    hero: {
      eyebrow: "建筑施工 · 翻新改造 · 室内装修",
      title: "Building the Next Verge",
      subtitle:
        "我们将超过40年的建筑与翻新经验，与现代设计理念相结合，打造实用、美观且经久耐用的空间。",
      ctaWork: "查看作品",
      ctaContact: "联系我们",
    },
    about: {
      eyebrow: "关于我们",
      title: "以经验建立信任",
      paragraphs: [
        "在 Artiverges Next，我们将超过40年的建筑与翻新经验，与现代设计理念相结合，打造实用、美观且经久耐用的空间。",
        "公司由新一代充满创意的专业人士创立，并由拥有数十年实战经验的建筑团队提供支持，专注于建筑施工、翻新改造、室内装修，以及为住宅、商业、酒店和零售项目提供定制解决方案。",
        "我们的优势在于对设计与执行的深刻理解。从概念开发、预算规划，到施工管理与项目交付，我们确保每一个细节都经过精心策划并专业执行。",
        "我们相信，每一个空间都应体现其用途、提升效率，并为使用者创造有意义的体验。",
      ],
    },
    why: {
      eyebrow: "为什么选择我们",
      title: "每个项目背后，是超过40年的综合经验",
      intro:
        "我们的工程师、工匠和设计师团队在每个阶段都用心倾听——从初步咨询到现场评估——量身定制方案，提升您的生活与工作方式。",
      points: [
        {
          title: "一站式无忧服务",
          description:
            "从概念到施工，我们提供完全整合的设计与建造方案——同一支专属团队，全程负责到底。",
        },
        {
          title: "提升效率的空间设计",
          description: "每一处布局都根据您真实的生活与工作方式规划，而不仅仅追求外观。",
        },
        {
          title: "精益求精的细节把控",
          description: "从材料选择到最终陈设，每个阶段都经过精心规划与专业执行。",
        },
        {
          title: "专业团队，全程支持",
          description:
            "提供持续的客户支持与售后服务，让您在项目前、中、后期都安心无忧。",
        },
      ],
    },
    services: {
      eyebrow: "我们的服务",
      title: "一支团队，服务从头贯彻到尾",
      items: [
        {
          title: "建筑施工",
          description:
            "为住宅、商业、酒店及零售项目提供全方位建筑施工服务。从结构工程到最终装修，我们以精准、优质和细致的态度交付每一个项目。",
        },
        {
          title: "翻新改造",
          description:
            "通过策略性翻新方案焕新既有空间。无论是室内升级、设施现代化，还是老旧物业改造，我们都能打造符合不断变化需求的环境。",
        },
        {
          title: "室内设计与装修",
          description:
            "根据每位客户的愿景量身定制、兼具创意与实用性的室内解决方案。我们专注于零售店铺、办公室、餐厅、咖啡馆、酒店、公寓及住宅项目。",
        },
        {
          title: "设计施工一体化",
          description:
            "整合设计、预算、施工与项目管理于同一团队的完整交付方案，确保效率、一致性与成本控制。",
        },
        {
          title: "项目管理",
          description:
            "专业的规划、协调与现场监督，确保每个项目按时、按预算完成，并达到最高质量标准。",
        },
        {
          title: "定制解决方案",
          description:
            "量身定制的家具、造型墙、展示系统、柜台及特殊室内构件，按照独特的项目需求设计与制作。",
        },
      ],
      capabilitiesTitle: "施工能力",
      capabilities: [
        "翻新改造",
        "隔断工程",
        "油漆工程",
        "天花吊顶",
        "玻璃工程",
        "不锈钢工程",
        "结构拆除",
        "维护保养",
        "地板与瓷砖",
      ],
    },
    process: {
      eyebrow: "工作流程",
      title: "五个步骤，一支专属团队",
      steps: [
        {
          title: "咨询与现场勘察",
          description: "实地勘察测量实际空间，并了解您的生活方式偏好与预算需求。",
        },
        {
          title: "设计方案展示",
          description: "提供概念板、平面布局与3D效果图，供材料选择与整体氛围确认。",
        },
        {
          title: "报价与工程量清单",
          description:
            "提供清晰的费用汇总与详细的工程量清单（BOQ），并可根据预算灵活调整。",
        },
        {
          title: "施工阶段",
          description: "施工期间通过实时项目跟踪系统持续更新进度。",
        },
        {
          title: "交付与软装陈设",
          description: "入住前进行最终软装陈设，并进行细致的质量检查。",
        },
      ],
    },
    turnkey: {
      eyebrow: "Artiverges Next",
      title: "全方位建筑交钥匙服务",
      body: "从概念到完工，我们提供建筑设计、室内装修、翻新改造与施工服务，以精准、透明和精湛工艺完成每一步。每个项目均由同一支专属团队全程管理，一站到底。",
    },
    portfolio: {
      eyebrow: "项目作品集",
      title: "近期精选作品",
      subtitle: "点击任意项目查看完整工程范围。",
      viewDetails: "查看详情",
      renderBadge: "3D效果图",
      viewMore: "查看更多作品",
    },
    contact: {
      eyebrow: "联系我们",
      title: "携手打造您的下一个项目",
      body: "告诉我们您的空间需求，我们将尽快与您联系，安排现场勘察与咨询。",
      copyright: "© {year} Artiverges Next 版权所有",
      staffLogin: "员工登录",
    },
    refer: {
      eyebrow: "推荐项目",
      title: "推荐项目给我们",
      body: "如果您认识正在寻找建筑施工、翻新改造或室内装修承包商的朋友，欢迎在这里推荐给 Artiverges Next。我们的团队会尽快跟进并协调各个环节。",
    },
    referralForm: {
      referrerName: "推荐人 / 合作伙伴姓名 *",
      referrerContact: "联系方式（电话/邮箱/LINE）",
      projectTitle: "推荐的项目 *",
      prospectName: "被推荐客户姓名（如有）",
      budget: "预估预算（泰铢）",
      details: "补充说明",
      errorReferrerName: "请填写推荐人姓名",
      errorProjectTitle: "请填写推荐的项目",
      successTitle: "感谢您的推荐",
      successBody: "我们已收到您的提交，团队会尽快与您联系。",
      submit: "提交推荐",
      submitting: "提交中...",
    },
  },
} as const;

export function useTranslation() {
  const { locale } = useLanguage();
  return translations[locale];
}
