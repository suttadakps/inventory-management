export type LocalizedText = { en: string; th: string; zh: string };

export type PortfolioProject = {
  slug: string;
  name: string;
  type: LocalizedText;
  image: string;
  /** Additional photos shown as a gallery in the project detail modal. */
  gallery?: string[];
  /** True when the images are 3D visualizations/renders rather than as-built photography. */
  isRender?: boolean;
  overview: LocalizedText;
  highlights: { title: LocalizedText; description: LocalizedText }[];
};

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    slug: "aspire-pinklao",
    name: "Aspire Pinklao",
    type: { en: "Interior Design", th: "งานออกแบบตกแต่งภายใน", zh: "室内设计" },
    image: "/marketing/project-aspire-pinklao.jpg",
    overview: {
      en: "Condo K'nut brings the timeless elegance of Mid-Century Modern design into contemporary living. Clean silhouettes, rich wood textures, and thoughtfully curated details come together to create a sophisticated yet inviting atmosphere.",
      th: "คอนโดคุณนัทนำเสนอความหรูหราเหนือกาลเวลาของสไตล์ Mid-Century Modern สู่การใช้ชีวิตร่วมสมัย รูปทรงที่เรียบง่าย พื้นผิวไม้ที่อบอุ่น และรายละเอียดที่คัดสรรมาอย่างพิถีพิถัน ผสมผสานกันจนเกิดเป็นบรรยากาศที่ทั้งหรูหราและอบอุ่นชวนให้เข้าไปพักผ่อน",
      zh: "Condo K'nut 将永恒优雅的中世纪现代风格带入当代生活。简洁的轮廓、丰富的木质纹理与精心挑选的细节相互融合，营造出既精致又温馨的氛围。",
    },
    highlights: [
      {
        title: {
          en: "Warm Wood Cabinetry & Open Shelving",
          th: "ตู้ไม้โทนอบอุ่นและชั้นวางแบบเปิด",
          zh: "温润木质柜体与开放式层架",
        },
        description: {
          en: "Custom walnut-toned built-ins with matte black hardware create striking contrasts and showcase books, decor, and personal collections.",
          th: "งานบิลท์อินไม้สีวอลนัทพร้อมมือจับสีดำด้าน สร้างความคอนทราสต์ที่โดดเด่นและใช้จัดแสดงหนังสือ ของตกแต่ง และของสะสมส่วนตัว",
          zh: "定制胡桃木色收纳柜搭配哑光黑五金，形成鲜明对比，展示书籍、摆件与个人收藏，风格低调而不失格调。",
        },
      },
      {
        title: {
          en: "Signature Mid-Century Touches",
          th: "ลายเซ็นสไตล์ Mid-Century",
          zh: "标志性中世纪细节",
        },
        description: {
          en: "A tufted leather bench, minimalist round coffee table, and geometric wall art celebrate classic design while staying fresh and relevant.",
          th: "เก้าอี้หนังบุนวม โต๊ะกลมทรงมินิมอล และงานศิลปะติดผนังลายเรขาคณิต เฉลิมฉลองดีไซน์คลาสสิกที่ยังคงความสดใหม่และร่วมสมัย",
          zh: "绒面皮革长凳、极简圆形茶几与几何墙面艺术，致敬经典设计，同时保持新鲜与当代感。",
        },
      },
      {
        title: {
          en: "Flexible Living & Workspaces",
          th: "พื้นที่ใช้ชีวิตและทำงานที่ปรับเปลี่ยนได้",
          zh: "灵活的生活与工作空间",
        },
        description: {
          en: "A dedicated workstation, cozy lounge area, and open kitchen blend seamlessly, supporting both productivity and relaxation.",
          th: "โต๊ะทำงานเฉพาะจุด มุมพักผ่อนสบายๆ และครัวแบบเปิด ผสานกันอย่างลงตัว รองรับทั้งการทำงานและการพักผ่อน",
          zh: "独立工作区、惬意休闲角与开放式厨房无缝衔接，兼顾效率与放松。",
        },
      },
      {
        title: {
          en: "Natural Light & Clean Lines",
          th: "แสงธรรมชาติและเส้นสายที่เรียบคม",
          zh: "自然采光与简洁线条",
        },
        description: {
          en: "Neutral tones and carefully placed lighting enhance the sense of openness and calm throughout the space.",
          th: "โทนสีเป็นกลางและการจัดวางแสงไฟอย่างพิถีพิถัน เสริมให้พื้นที่ดูโปร่งโล่งและสงบยิ่งขึ้น",
          zh: "中性色调与精心布置的灯光，提升空间的通透感与宁静氛围。",
        },
      },
    ],
  },
  {
    slug: "millennium-residence",
    name: "Millennium Residence",
    type: { en: "Interior Design", th: "งานออกแบบตกแต่งภายใน", zh: "室内设计" },
    image: "/marketing/project-millennium-residence.jpg",
    overview: {
      en: "This renovation embodies sophisticated contemporary living with clean lines, natural textures, and a refined palette. Each area is thoughtfully crafted to elevate everyday moments with understated luxury and functional design.",
      th: "การรีโนเวทครั้งนี้สะท้อนการใช้ชีวิตร่วมสมัยที่หรูหรา ด้วยเส้นสายที่เรียบคม พื้นผิวจากธรรมชาติ และโทนสีที่ประณีต ทุกพื้นที่ถูกออกแบบอย่างพิถีพิถันเพื่อยกระดับช่วงเวลาในชีวิตประจำวันด้วยความหรูหราที่เรียบง่ายและฟังก์ชันการใช้งานที่ลงตัว",
      zh: "此次翻新体现了精致的当代生活方式，简洁的线条、自然的质感与考究的配色相辅相成。每个区域都经过精心打造，以低调的奢华与实用的设计提升日常生活的每一刻。",
    },
    highlights: [
      {
        title: {
          en: "Sleek Open Kitchen & Dining",
          th: "ครัวเปิดโล่งสไตล์โมเดิร์น",
          zh: "现代开放式厨房与餐厅",
        },
        description: {
          en: "Seamless cabinetry in muted taupe tones, integrated appliances, and a striking marble island that doubles as a casual dining bar.",
          th: "ตู้บิลท์อินโทนสีเอิร์ธโทนไร้รอยต่อ เครื่องใช้ไฟฟ้าฝังตัว และเกาะครัวหินอ่อนที่ใช้เป็นบาร์รับประทานอาหารได้ในตัว",
          zh: "低调灰褐色系无缝橱柜、嵌入式电器，以及兼作休闲餐吧的醒目大理石中岛。",
        },
      },
      {
        title: {
          en: "Tailored Wardrobe Solutions",
          th: "ตู้เสื้อผ้าที่ออกแบบเฉพาะ",
          zh: "定制衣帽间方案",
        },
        description: {
          en: "A custom walk-in wardrobe with glass doors, ambient lighting, and organized compartments for a clutter-free dressing experience.",
          th: "วอล์กอินคลอเซ็ทบิลท์อินพร้อมประตูกระจก แสงไฟบรรยากาศ และช่องจัดเก็บเป็นระเบียบ เพื่อการแต่งตัวที่สะดวกไร้ความยุ่งเหยิง",
          zh: "定制步入式衣帽间配备玻璃门、氛围灯光与分类收纳格，打造整洁有序的更衣体验。",
        },
      },
      {
        title: {
          en: "Serene Bathroom Sanctuary",
          th: "ห้องน้ำสงบดั่งสปา",
          zh: "宁静的卫浴空间",
        },
        description: {
          en: "Warm stone finishes and vertical red tiles as a bold accent, with a floating vanity and minimalist fixtures for a spa-inspired retreat.",
          th: "พื้นผิวหินโทนอบอุ่นและกระเบื้องแนวตั้งสีแดงเป็นจุดเด่น พร้อมอ่างล้างหน้าลอยตัวและก๊อกน้ำสไตล์มินิมอล ให้ความรู้สึกผ่อนคลายดั่งสปา",
          zh: "温润石材饰面搭配醒目的竖向红色瓷砖，悬浮式洗手台与极简五金，营造spa般的静谧氛围。",
        },
      },
      {
        title: {
          en: "Warm Materials & Ambient Lighting",
          th: "วัสดุอบอุ่นและแสงไฟบรรยากาศ",
          zh: "温暖材质与氛围灯光",
        },
        description: {
          en: "Chevron-patterned flooring, soft neutral walls, and thoughtfully placed illumination create a welcoming, timeless atmosphere.",
          th: "พื้นลายเชฟรอน ผนังโทนสีนวล และการจัดแสงไฟอย่างพิถีพิถัน สร้างบรรยากาศอบอุ่นต้อนรับและไม่ล้าสมัย",
          zh: "人字形地板、柔和的中性色墙面，以及精心布置的灯光，营造出温馨隽永的氛围。",
        },
      },
    ],
  },
  {
    slug: "ananda-sportlife-home",
    name: "Ananda Sportlife Home",
    type: { en: "Full Renovation", th: "รีโนเวทเต็มรูปแบบ", zh: "全面翻新" },
    image: "/marketing/project-ananda-sportlife-home.jpg",
    gallery: [
      "/marketing/project-ananda-sportlife-home-garden-render.jpg",
      "/marketing/project-ananda-sportlife-home-living-render.jpg",
      "/marketing/project-ananda-sportlife-home-tv-lounge-render.jpg",
      "/marketing/project-ananda-sportlife-home-closet-render.jpg",
    ],
    isRender: true,
    overview: {
      en: "This home renovation reimagines a classic residence with refined contemporary elegance. Shown here as 3D visualizations, the design balances bold architectural lines and traditional detailing for a facade that feels sophisticated yet welcoming.",
      th: "การรีโนเวทบ้านหลังนี้ตีความบ้านสไตล์คลาสสิกใหม่ด้วยความหรูหราร่วมสมัยที่ประณีต ภาพที่แสดงเป็นภาพจำลอง 3 มิติ ผสมผสานเส้นสายทางสถาปัตยกรรมที่โดดเด่นเข้ากับรายละเอียดแบบดั้งเดิม ให้ความรู้สึกหรูหราแต่ยังคงความอบอุ่นต้อนรับ",
      zh: "此次住宅翻新以精致的当代优雅重新演绎经典宅邸。此处展示为3D效果图，设计平衡了大胆的建筑线条与传统细节，营造出既精致又亲切的立面效果。",
    },
    highlights: [
      {
        title: {
          en: "Elegant Archways & Geometry",
          th: "ซุ้มโค้งและรูปทรงเรขาคณิตที่สง่างาม",
          zh: "典雅拱形与几何造型",
        },
        description: {
          en: "A signature arched entry and balcony create a striking focal point, complemented by circular windows that soften the strong vertical lines.",
          th: "ทางเข้าซุ้มโค้งและระเบียงที่เป็นเอกลักษณ์สร้างจุดเด่นที่สะดุดตา เสริมด้วยหน้าต่างทรงกลมที่ช่วยลดความแข็งของเส้นแนวตั้ง",
          zh: "标志性拱形入口与阳台构成醒目焦点，搭配圆形窗户柔化了强烈的垂直线条。",
        },
      },
      {
        title: {
          en: "Monochrome Palette & Refined Contrast",
          th: "โทนสีโมโนโครมและคอนทราสต์ที่ประณีต",
          zh: "黑白配色与精致对比",
        },
        description: {
          en: "Crisp white walls paired with deep charcoal trim elevate the overall aesthetic and enhance the architecture's timeless appeal.",
          th: "ผนังสีขาวสะอาดตาจับคู่กับกรอบสีเทาเข้ม ยกระดับความสวยงามโดยรวมและเสริมเสน่ห์ที่ไม่ล้าสมัยของงานสถาปัตยกรรม",
          zh: "简洁的白墙搭配深炭灰色边框，提升整体美感，凸显建筑历久弥新的魅力。",
        },
      },
      {
        title: {
          en: "Seamless Indoor-Outdoor Connection",
          th: "การเชื่อมต่อพื้นที่ในร่มและกลางแจ้งอย่างไร้รอยต่อ",
          zh: "室内外无缝衔接",
        },
        description: {
          en: "Expansive windows and doors invite natural light in while visually connecting the home to the landscaped garden spaces.",
          th: "หน้าต่างและประตูบานใหญ่ให้แสงธรรมชาติส่องเข้ามา พร้อมเชื่อมสายตาระหว่างตัวบ้านกับพื้นที่สวนจัดภูมิทัศน์",
          zh: "宽大的门窗引入自然采光，同时在视觉上将住宅与景观花园空间相连。",
        },
      },
      {
        title: {
          en: "Distinctive Roofline",
          th: "เส้นหลังคาที่โดดเด่นเป็นเอกลักษณ์",
          zh: "独具特色的屋顶线条",
        },
        description: {
          en: "Multi-pitched tiled roofs bring depth and character, celebrating both classic and modern influences.",
          th: "หลังคากระเบื้องทรงหลายชั้นเพิ่มมิติและเอกลักษณ์เฉพาะตัว ผสานอิทธิพลของงานคลาสสิกและโมเดิร์นเข้าไว้ด้วยกัน",
          zh: "多坡度瓦片屋顶增添层次与个性，融合古典与现代的双重影响。",
        },
      },
    ],
  },
  {
    slug: "baan-klang-krung-residence",
    name: "Baan Klang Krung Residence",
    type: { en: "Full Renovation", th: "รีโนเวทเต็มรูปแบบ", zh: "全面翻新" },
    image: "/marketing/project-bannklangkrung.jpg",
    gallery: [
      "/marketing/project-bannklangkrung-ceiling-install.jpg",
      "/marketing/project-bannklangkrung-hallway-wardrobes.jpg",
      "/marketing/project-bannklangkrung-bathroom-1.jpg",
      "/marketing/project-bannklangkrung-bathroom-2.jpg",
      "/marketing/project-bannklangkrung-vanity-1.jpg",
      "/marketing/project-bannklangkrung-vanity-2.jpg",
      "/marketing/project-bannklangkrung-shower.jpg",
    ],
    overview: {
      en: "A full renovation of a 100 sq.w. residence, rebuilding flooring, plumbing, and finishes throughout for a refined, modern living experience.",
      th: "การรีโนเวทเต็มรูปแบบของที่พักอาศัยขนาด 100 ตารางวา ปรับปรุงพื้นผิว ระบบประปา และงานตกแต่งใหม่ทั้งหมด เพื่อประสบการณ์การอยู่อาศัยที่ทันสมัยและประณีต",
      zh: "对一处占地100平方哇（Wah）住宅的全面翻新，重新铺设地板、更新水管与各处装修，打造精致现代的居住体验。",
    },
    highlights: [
      {
        title: { en: "Flooring", th: "งานพื้น", zh: "地板工程" },
        description: {
          en: "Complete removal of old flooring and installation of new finishes throughout the entire property.",
          th: "รื้อพื้นเดิมออกทั้งหมดและปูวัสดุใหม่ทั่วทั้งบ้าน",
          zh: "拆除原有地板，全屋铺设全新装修材料。",
        },
      },
      {
        title: {
          en: "Plumbing & Hot Water System",
          th: "ระบบประปาและน้ำร้อน",
          zh: "给排水与热水系统",
        },
        description: {
          en: "Full upgrade with new pipelines for durability and efficiency, plus a modern hot water system.",
          th: "อัปเกรดระบบท่อประปาใหม่ทั้งหมดเพื่อความทนทานและมีประสิทธิภาพ พร้อมติดตั้งระบบทำน้ำอุ่นสมัยใหม่",
          zh: "全面升级管线，提升耐用性与效率，并加装现代化热水系统。",
        },
      },
      {
        title: {
          en: "Tiling & Sanitary Ware",
          th: "งานกระเบื้องและสุขภัณฑ์",
          zh: "瓷砖与卫浴洁具",
        },
        description: {
          en: "Premium tiles in all key areas paired with brand-new, modern sanitary fittings.",
          th: "ปูกระเบื้องเกรดพรีเมียมในทุกพื้นที่สำคัญ พร้อมสุขภัณฑ์ใหม่ทันสมัย",
          zh: "所有主要区域铺设优质瓷砖，搭配全新现代化卫浴洁具。",
        },
      },
      {
        title: { en: "Property Size", th: "ขนาดพื้นที่", zh: "房屋面积" },
        description: {
          en: "100 sq.w. with 3 bedrooms and 4 bathrooms, fully tailored for modern living.",
          th: "พื้นที่ 100 ตารางวา 3 ห้องนอน 4 ห้องน้ำ ออกแบบให้เหมาะกับการใช้ชีวิตสมัยใหม่",
          zh: "占地100平方哇，3间卧室、4间卫浴，专为现代生活量身打造。",
        },
      },
    ],
  },
  {
    slug: "mbk-center",
    name: "MBK Center",
    type: { en: "Commercial Renovation", th: "รีโนเวทเชิงพาณิชย์", zh: "商业翻新" },
    image: "/marketing/project-mbkcenter.jpg",
    gallery: [
      "/marketing/project-mbkcenter-atrium-decor-1.jpg",
      "/marketing/project-mbkcenter-atrium-decor-2.jpg",
      "/marketing/project-mbkcenter-atrium-decor-3.jpg",
      "/marketing/project-mbkcenter-atrium-decor-4.jpg",
      "/marketing/project-mbkcenter-atrium-screen.jpg",
      "/marketing/project-mbkcenter-skywalk-ceiling.jpg",
      "/marketing/project-mbkcenter-skywalk-exterior.jpg",
      "/marketing/project-mbkcenter-skywalk-handrail.jpg",
      "/marketing/project-mbkcenter-atrium-overview-1.jpg",
      "/marketing/project-mbkcenter-atrium-overview-2.jpg",
      "/marketing/project-mbkcenter-atrium-screen-closeup.jpg",
      "/marketing/project-mbkcenter-skywalk-1.jpg",
      "/marketing/project-mbkcenter-skywalk-2.jpg",
    ],
    overview: {
      en: "Comprehensive upgrades across MBK Center's mobile retail zone, ground floor entrance, and the skywalk connecting to Chulalongkorn University.",
      th: "ปรับปรุงยกระดับพื้นที่ MBK Center อย่างครอบคลุม ทั้งโซนขายมือถือ ทางเข้าชั้นล่าง และสกายวอล์กเชื่อมต่อไปยังจุฬาลงกรณ์มหาวิทยาลัย",
      zh: "对 MBK Center 的手机零售区、一楼入口及连接朱拉隆功大学的天桥进行全面升级改造。",
    },
    highlights: [
      {
        title: {
          en: "Floors 6 & 7 — Mobile Zone",
          th: "ชั้น 6 และ 7 — โซนมือถือ",
          zh: "6至7楼——手机专区",
        },
        description: {
          en: "Full renovation of the mobile phone retail zone, with redesigned display areas and new LED lighting systems for a modern atmosphere.",
          th: "รีโนเวทโซนขายมือถือทั้งหมด ออกแบบพื้นที่จัดแสดงสินค้าใหม่ พร้อมระบบไฟ LED ใหม่เพื่อบรรยากาศที่ทันสมัย",
          zh: "全面翻新手机零售区，重新设计展示区域，并加装全新LED照明系统，营造现代化氛围。",
        },
      },
      {
        title: {
          en: "Ground Floor — Entrance Area",
          th: "ชั้นล่าง — พื้นที่ทางเข้า",
          zh: "一楼——入口区域",
        },
        description: {
          en: "Slatted ceiling panels combined with integrated LED lighting for a welcoming first impression.",
          th: "ติดตั้งแผงฝ้าเพดานแบบเกล็ดร่วมกับไฟ LED ฝังตัว สร้างความประทับใจแรกพบที่น่าต้อนรับ",
          zh: "采用格栅天花板搭配嵌入式LED照明，为访客带来温馨的第一印象。",
        },
      },
      {
        title: {
          en: "Skywalk to Chulalongkorn University",
          th: "สกายวอล์กสู่จุฬาลงกรณ์มหาวิทยาลัย",
          zh: "通往朱拉隆功大学的天桥",
        },
        description: {
          en: "Design improvements and integrated LED lighting to improve safety, functionality, and visual appeal along the walkway.",
          th: "ปรับปรุงงานออกแบบและติดตั้งไฟ LED ฝังตัว เพื่อเพิ่มความปลอดภัย ฟังก์ชันการใช้งาน และความสวยงามตลอดทางเดิน",
          zh: "改善设计并加装嵌入式LED照明，提升天桥沿线的安全性、实用性与视觉效果。",
        },
      },
    ],
  },
  {
    slug: "dhamma-mongkol-temple",
    name: "Dhamma Mongkol Temple",
    type: {
      en: "Meditation Hall Renovation",
      th: "รีโนเวทห้องปฏิบัติธรรม",
      zh: "禅修堂翻新",
    },
    image: "/marketing/project-dhammamongkoltemple.jpg",
    overview: {
      en: "Renovation of the temple's meditation hall — flooring, ceiling, and acoustics — to create a serene environment for teaching and practice.",
      th: "รีโนเวทห้องปฏิบัติธรรมของวัด ทั้งงานพื้น ฝ้าเพดาน และระบบอะคูสติก เพื่อสร้างบรรยากาศที่สงบเหมาะแก่การเรียนการสอนและปฏิบัติธรรม",
      zh: "对寺院禅修堂进行翻新——包括地板、天花与声学处理——营造宁静的教学与修行环境。",
    },
    highlights: [
      {
        title: {
          en: "Flooring & Ceiling Renovation",
          th: "งานพื้นและฝ้าเพดาน",
          zh: "地板与天花翻新",
        },
        description: {
          en: "New flooring for long-term durability, plus a new ceiling system with acoustic treatment for improved sound control.",
          th: "ปูพื้นใหม่เพื่อความทนทานระยะยาว พร้อมระบบฝ้าเพดานใหม่ที่มีการบำบัดเสียงเพื่อควบคุมคุณภาพเสียงให้ดียิ่งขึ้น",
          zh: "铺设经久耐用的新地板，并加装带隔音处理的新天花系统，提升声音控制效果。",
        },
      },
      {
        title: {
          en: "Tiered Stage Construction",
          th: "งานก่อสร้างเวทีแบบขั้นบันได",
          zh: "阶梯式讲台建造",
        },
        description: {
          en: "A tiered stage within the main teaching hall, improving visibility and the learning experience for students and practitioners.",
          th: "สร้างเวทีแบบขั้นบันไดในห้องเรียนหลัก เพื่อเพิ่มทัศนวิสัยและประสบการณ์การเรียนรู้ให้แก่นักเรียนและผู้ปฏิบัติธรรม",
          zh: "在主讲堂内建造阶梯式讲台，提升学员与修行者的视野与学习体验。",
        },
      },
      {
        title: { en: "Acoustic Panels", th: "แผงดูดซับเสียง", zh: "隔音板安装" },
        description: {
          en: "Sound-absorbing panels throughout the hall, optimized for meditation, chanting, and Dhamma teaching sessions.",
          th: "ติดตั้งแผงดูดซับเสียงทั่วทั้งห้อง ปรับให้เหมาะสมสำหรับการทำสมาธิ การสวดมนต์ และการเรียนการสอนธรรมะ",
          zh: "全场安装吸音板，针对禅修、诵经与佛法教学场景进行声学优化。",
        },
      },
    ],
  },
  {
    slug: "patthanagarn-four-storey-house",
    name: "Patthanagarn Four-Storey House",
    type: { en: "New Construction", th: "งานก่อสร้างใหม่", zh: "新建工程" },
    image: "/marketing/project-patthanakarn.jpg",
    overview: {
      en: "Design and construction of a modern four-storey single house, combining functionality with architectural elegance, open space, and natural light.",
      th: "ออกแบบและก่อสร้างบ้านเดี่ยว 4 ชั้นสไตล์โมเดิร์น ผสมผสานฟังก์ชันการใช้งานเข้ากับความสง่างามทางสถาปัตยกรรม พื้นที่โปร่งโล่ง และแสงธรรมชาติ",
      zh: "设计并建造一栋现代四层独栋住宅，将实用功能与建筑美感、开放空间及自然采光相结合。",
    },
    highlights: [
      {
        title: { en: "Double Volume Hall", th: "โถงดับเบิลวอลุ่ม", zh: "挑高中庭大厅" },
        description: {
          en: "A dramatic double-volume central hall introduces vertical openness, natural light, and ventilation for family gatherings.",
          th: "โถงกลางแบบดับเบิลวอลุ่มที่โดดเด่น เพิ่มความโปร่งในแนวตั้ง แสงธรรมชาติ และการระบายอากาศ เหมาะสำหรับการรวมตัวของครอบครัว",
          zh: "极具视觉冲击力的挑高中庭大厅，带来垂直方向的开阔感、自然采光与通风，适合家庭聚会。",
        },
      },
      {
        title: {
          en: "Layered Architectural Design",
          th: "งานออกแบบสถาปัตยกรรมแบบเลเยอร์",
          zh: "分层次建筑设计",
        },
        description: {
          en: "Additional design layers across the façade and interior create visual depth while maintaining privacy and a refined aesthetic.",
          th: "เลเยอร์ดีไซน์เพิ่มเติมทั้งด้านหน้าอาคารและภายใน สร้างมิติทางสายตา พร้อมคงความเป็นส่วนตัวและความสวยงามที่ประณีต",
          zh: "立面与室内的多层次设计手法营造视觉深度，同时兼顾私密性与精致美感。",
        },
      },
      {
        title: {
          en: "Functional Living Spaces",
          th: "พื้นที่ใช้สอยที่ตอบโจทย์การใช้งาน",
          zh: "实用生活空间",
        },
        description: {
          en: "Thoughtfully designed layouts across 4 floors, balancing private and communal zones for comfort and flexibility.",
          th: "ผังพื้นที่ทั้ง 4 ชั้นถูกออกแบบอย่างพิถีพิถัน สมดุลระหว่างพื้นที่ส่วนตัวและพื้นที่ส่วนกลาง เพื่อความสบายและความยืดหยุ่นในการใช้งาน",
          zh: "四层楼层布局经过精心规划，平衡私密与公共区域，兼具舒适性与灵活性。",
        },
      },
    ],
  },
  {
    slug: "bukarn-yothin-pattana-residence",
    name: "Bukarn Yothin Pattana Residence",
    type: {
      en: "Renovation & Interior Upgrade",
      th: "รีโนเวทและอัปเกรดงานตกแต่งภายใน",
      zh: "翻新与室内升级",
    },
    image: "/marketing/project-bugannyothinpatthana.jpg",
    overview: {
      en: "Lighting, electrical, and finishing upgrades throughout the residence to refresh the atmosphere and support modern living needs.",
      th: "อัปเกรดงานไฟ ระบบไฟฟ้า และงานตกแต่งทั่วทั้งบ้าน เพื่อฟื้นฟูบรรยากาศและรองรับการใช้ชีวิตสมัยใหม่",
      zh: "对住宅的照明、电力与装修进行全面升级，焕新居住氛围，满足现代生活需求。",
    },
    highlights: [
      {
        title: { en: "Lighting Installation", th: "งานติดตั้งไฟ", zh: "灯光安装" },
        description: {
          en: "Decorative lighting fixtures inside and out, highlighting architectural details and creating a warm living environment.",
          th: "ติดตั้งโคมไฟตกแต่งทั้งภายในและภายนอก เน้นรายละเอียดทางสถาปัตยกรรมและสร้างบรรยากาศอบอุ่นในการอยู่อาศัย",
          zh: "室内外均安装装饰性灯具，突出建筑细节，营造温馨的居住环境。",
        },
      },
      {
        title: {
          en: "Electrical System Improvement",
          th: "ปรับปรุงระบบไฟฟ้า",
          zh: "电力系统改善",
        },
        description: {
          en: "Additional power outlets throughout the residence, planned for convenience and modern appliances.",
          th: "เพิ่มปลั๊กไฟทั่วทั้งบ้าน วางแผนเพื่อความสะดวกและรองรับเครื่องใช้ไฟฟ้าสมัยใหม่",
          zh: "全屋增设电源插座，兼顾便利性与现代家电使用需求。",
        },
      },
      {
        title: {
          en: "Painting & Finishing",
          th: "งานสีและงานตกแต่งผิว",
          zh: "油漆与装修工程",
        },
        description: {
          en: "Repainted walls and ceilings using premium materials for durability, clean finishes, and an elegant atmosphere.",
          th: "ทาสีผนังและฝ้าเพดานใหม่ด้วยวัสดุเกรดพรีเมียม เพื่อความทนทาน ผิวสัมผัสที่เรียบเนียน และบรรยากาศที่หรูหรา",
          zh: "使用优质材料重新粉刷墙面与天花，确保耐用性、干净的表面效果与优雅氛围。",
        },
      },
    ],
  },
  {
    slug: "niche-mono-ratchavipha",
    name: "The Niche Mono Ratchavipha",
    type: { en: "Condominium Renovation", th: "รีโนเวทคอนโดมิเนียม", zh: "公寓翻新" },
    image: "/marketing/project-nichemono.jpg",
    overview: {
      en: "Glass, ceiling, and repainting works to give this condominium unit a cleaner, more spacious, and contemporary feel.",
      th: "งานกระจก ฝ้าเพดาน และทาสีใหม่ เพื่อให้ยูนิตคอนโดมิเนียมนี้ดูสะอาดตา โปร่งโล่ง และมีความร่วมสมัยมากขึ้น",
      zh: "通过玻璃、天花与重新粉刷工程，让这套公寓单位呈现更简洁、宽敞且现代的风格。",
    },
    highlights: [
      {
        title: { en: "Glass Installation", th: "งานติดตั้งกระจก", zh: "玻璃安装工程" },
        description: {
          en: "New glass panels improve natural light flow and create a more spacious atmosphere.",
          th: "แผงกระจกใหม่ช่วยเพิ่มการไหลเวียนของแสงธรรมชาติและสร้างบรรยากาศที่โปร่งโล่งยิ่งขึ้น",
          zh: "全新玻璃隔断改善自然采光流动，营造更宽敞的空间感。",
        },
      },
      {
        title: { en: "Ceiling Works", th: "งานฝ้าเพดาน", zh: "天花工程" },
        description: {
          en: "Construction and finishing of a new ceiling system, designed for a clean, modern look with support for integrated lighting.",
          th: "ก่อสร้างและตกแต่งระบบฝ้าเพดานใหม่ ออกแบบให้ดูสะอาดตาทันสมัย พร้อมรองรับการติดตั้งไฟฝังตัว",
          zh: "施工与完成全新天花系统，设计简洁现代，并预留嵌入式灯具安装空间。",
        },
      },
      {
        title: { en: "Repainting", th: "งานทาสีใหม่", zh: "重新粉刷" },
        description: {
          en: "Complete repainting with premium-grade paint for a clean, elegant, and contemporary feel.",
          th: "ทาสีใหม่ทั้งหมดด้วยสีเกรดพรีเมียม เพื่อความสะอาดตา หรูหรา และความรู้สึกร่วมสมัย",
          zh: "使用优质涂料全面重新粉刷，呈现干净、优雅且现代的质感。",
        },
      },
    ],
  },
  {
    slug: "siamsnus-silom",
    name: "SiamSnus Silom",
    type: { en: "Shop Construction", th: "งานก่อสร้างร้านค้า", zh: "店铺工程" },
    image: "/marketing/project-siamsnussilom.jpg",
    gallery: [
      "/marketing/project-siamsnussilom-shelving-install.jpg",
      "/marketing/project-siamsnussilom-cooler-nook.jpg",
      "/marketing/project-siamsnussilom-storefront.jpg",
      "/marketing/project-siamsnussilom-display-1.jpg",
      "/marketing/project-siamsnussilom-display-2.jpg",
      "/marketing/project-siamsnussilom-display-close.jpg",
    ],
    overview: {
      en: "A bare-shell retail build-out with custom display fixtures, bold finishes, and full systems installation tailored to the brand.",
      th: "งานก่อสร้างร้านค้าจากพื้นที่เปล่า (Bare Shell) พร้อมเฟอร์นิเจอร์จัดแสดงสินค้าที่ออกแบบเฉพาะ งานตกแต่งที่โดดเด่น และระบบครบวงจรที่ออกแบบให้เข้ากับแบรนด์",
      zh: "从毛坯空间开始的零售店铺工程，配备定制展示装置、大胆的装修风格，以及为品牌量身定制的全套系统安装。",
    },
    highlights: [
      {
        title: { en: "Wall Finishing", th: "งานตกแต่งผนัง", zh: "墙面装饰工程" },
        description: {
          en: "Black mosaic tiles on feature walls create a bold, modern atmosphere that enhances the shop's identity.",
          th: "กระเบื้องโมเสกสีดำบนผนังจุดเด่นสร้างบรรยากาศที่โดดเด่นทันสมัย เสริมอัตลักษณ์ของร้านให้ชัดเจนยิ่งขึ้น",
          zh: "特色墙面采用黑色马赛克瓷砖，营造大胆现代的氛围，强化店铺品牌形象。",
        },
      },
      {
        title: {
          en: "Bare-Shell Construction & Display Setup",
          th: "งานก่อสร้างจากพื้นที่เปล่าและจัดวางดิสเพลย์",
          zh: "毛坯施工与展示布置",
        },
        description: {
          en: "A custom layout designed for efficient product placement and customer flow.",
          th: "ออกแบบผังร้านเฉพาะเพื่อการจัดวางสินค้าและการเดินของลูกค้าที่มีประสิทธิภาพ",
          zh: "定制化布局设计，实现高效的产品陈列与顾客动线规划。",
        },
      },
      {
        title: {
          en: "Flooring, Painting & Electrical",
          th: "งานพื้น สี และระบบไฟฟ้า",
          zh: "地板、油漆与电气工程",
        },
        description: {
          en: "Parquet wood flooring, full interior and exterior painting, and a complete electrical installation for lighting and display units.",
          th: "ปูพื้นไม้ปาร์เก้ ทาสีทั้งภายในและภายนอก พร้อมติดตั้งระบบไฟฟ้าครบวงจรสำหรับไฟส่องสว่างและจุดจัดแสดงสินค้า",
          zh: "铺设实木拼花地板，完成室内外全面粉刷，并为照明与展示装置安装完整电气系统。",
        },
      },
    ],
  },
  {
    slug: "mirror-muse-social-club",
    name: "Mirror Muse Social Club",
    type: {
      en: "Nightlife Venue Fit-Out",
      th: "งานตกแต่งภายในสถานบันเทิงยามค่ำคืน",
      zh: "夜生活场所装修工程",
    },
    image: "/marketing/project-mirrormuse.jpg",
    gallery: [
      "/marketing/project-mirrormuse-booth-arches.jpg",
      "/marketing/project-mirrormuse-curved-booth.jpg",
      "/marketing/project-mirrormuse-full-room-panorama.jpg",
      "/marketing/project-mirrormuse-pool-table.jpg",
      "/marketing/project-mirrormuse-corridor-brick.jpg",
      "/marketing/project-mirrormuse-mirror-corridor-1.jpg",
      "/marketing/project-mirrormuse-mirror-corridor-2.jpg",
      "/marketing/project-mirrormuse-mirror-corridor-3.jpg",
    ],
    overview: {
      en: "A full interior fit-out for Mirror Muse Social Club, built end-to-end around a bold, immersive nightlife atmosphere — from structural and MEP works to custom furniture and lighting integration.",
      th: "งานตกแต่งภายในครบวงจรสำหรับ Mirror Muse Social Club ออกแบบและก่อสร้างตั้งแต่ต้นจนจบเพื่อสร้างบรรยากาศไนต์ไลฟ์ที่ดื่มด่ำและโดดเด่น ตั้งแต่งานโครงสร้างและระบบวิศวกรรม ไปจนถึงเฟอร์นิเจอร์สั่งทำและระบบไฟ",
      zh: "为 Mirror Muse Social Club 打造的全套室内装修工程，从结构与机电工程到定制家具与灯光整合，全程围绕大胆而沉浸式的夜生活氛围打造。",
    },
    highlights: [
      {
        title: {
          en: "Mirrored Coffered Ceiling",
          th: "ฝ้าเพดานกระจกทรงคอฟเฟอร์",
          zh: "镜面藻井天花",
        },
        description: {
          en: "A custom mirror-paneled ceiling grid amplifies the venue's lighting and creates a striking sense of depth across the space.",
          th: "กริดฝ้าเพดานกระจกที่ออกแบบเฉพาะ ช่วยขยายแสงไฟภายในร้านและสร้างมิติความลึกที่โดดเด่นทั่วทั้งพื้นที่",
          zh: "定制镜面天花网格放大场内灯光效果，为整个空间营造出强烈的纵深感。",
        },
      },
      {
        title: {
          en: "Illuminated Arched Feature Walls",
          th: "ผนังโค้งไฟส่องสว่าง",
          zh: "拱形发光造型墙",
        },
        description: {
          en: "Backlit arched wall panels in warm amber tones anchor the seating areas and give the room its signature glow.",
          th: "แผงผนังทรงโค้งไฟส่องหลังโทนสีอำพันอบอุ่น เป็นจุดยึดของโซนที่นั่งและสร้างแสงเรืองที่เป็นเอกลักษณ์ของร้าน",
          zh: "暖琥珀色背光拱形墙面装置，锚定座位区域，赋予空间标志性的光晕氛围。",
        },
      },
      {
        title: {
          en: "Full LED Video Wall Integration",
          th: "ผนัง LED วิดีโอขนาดใหญ่",
          zh: "全尺寸LED视频墙集成",
        },
        description: {
          en: "A large-format LED wall was built into the architecture for branding, visuals, and event production.",
          th: "ติดตั้งจอ LED ขนาดใหญ่เข้ากับโครงสร้างอาคาร เพื่อใช้แสดงแบรนด์ ภาพวิชวล และงานอีเวนต์",
          zh: "大型LED显示屏融入建筑结构，用于品牌展示、视觉效果与活动制作。",
        },
      },
      {
        title: {
          en: "Custom Furniture & Lounge Layout",
          th: "เฟอร์นิเจอร์สั่งทำและผังพื้นที่เลานจ์",
          zh: "定制家具与休闲区布局",
        },
        description: {
          en: "Bespoke banquette seating, bar-height tables, and a DJ booth were designed and built to fit the venue's flow and capacity.",
          th: "ที่นั่งบูธ โต๊ะสูงระดับบาร์ และบูธดีเจที่ออกแบบและสร้างขึ้นเฉพาะ ให้เหมาะกับการไหลเวียนและความจุของร้าน",
          zh: "定制卡座沙发、吧台高脚桌与DJ台，均按场地动线与容纳需求设计打造。",
        },
      },
    ],
  },
  {
    slug: "ananda-residence",
    name: "Ananda Residence",
    type: { en: "Full Renovation", th: "รีโนเวทเต็มรูปแบบ", zh: "全面翻新" },
    image: "/marketing/project-anandaresidence.jpg",
    gallery: [
      "/marketing/project-anandaresidence-exterior-day.jpg",
      "/marketing/project-anandaresidence-dining-kitchen-living.jpg",
      "/marketing/project-anandaresidence-living-room-sofa.jpg",
      "/marketing/project-anandaresidence-dining-table.jpg",
      "/marketing/project-anandaresidence-kitchen.jpg",
      "/marketing/project-anandaresidence-living-room-arch.jpg",
      "/marketing/project-anandaresidence-living-room-window.jpg",
      "/marketing/project-anandaresidence-living-room-wide.jpg",
      "/marketing/project-anandaresidence-sofa-detail.jpg",
      "/marketing/project-anandaresidence-dining-living-open.jpg",
      "/marketing/project-anandaresidence-living-room-landscape.jpg",
      "/marketing/project-anandaresidence-living-room-arch-alt.jpg",
      "/marketing/project-anandaresidence-upstairs-room.jpg",
    ],
    overview: {
      en: "Full renovation of a two-storey, 300 sq.w. single house, with comprehensive upgrades covering the interior, exterior, and surrounding landscape.",
      th: "รีโนเวทเต็มรูปแบบบ้านเดี่ยว 2 ชั้น ขนาด 300 ตารางวา ครอบคลุมการอัปเกรดทั้งภายใน ภายนอก และภูมิทัศน์โดยรอบ",
      zh: "对一栋占地300平方哇的两层独栋住宅进行全面翻新，涵盖室内、室外及周边景观的全方位升级。",
    },
    highlights: [
      {
        title: { en: "Flooring & Ceiling", th: "งานพื้นและฝ้าเพดาน", zh: "地板与天花工程" },
        description: {
          en: "High-quality tiles throughout, plus recessed ceilings with concealed lighting to enhance ambiance.",
          th: "ปูกระเบื้องคุณภาพสูงทั่วทั้งบ้าน พร้อมฝ้าเพดานฝังพร้อมไฟซ่อนเพื่อเสริมบรรยากาศ",
          zh: "全屋铺设优质瓷砖，并采用嵌入式天花搭配隐藏灯光，提升整体氛围。",
        },
      },
      {
        title: { en: "Systems Upgrade", th: "อัปเกรดระบบต่างๆ", zh: "系统全面升级" },
        description: {
          en: "New air-conditioning, electrical, and plumbing systems for efficiency, comfort, and durability.",
          th: "ติดตั้งระบบแอร์ ไฟฟ้า และประปาใหม่ทั้งหมด เพื่อประสิทธิภาพ ความสบาย และความทนทาน",
          zh: "更新空调、电力与给排水系统，提升效率、舒适度与耐用性。",
        },
      },
      {
        title: {
          en: "Landscape & Kitchen Extension",
          th: "งานภูมิทัศน์และต่อเติมครัว",
          zh: "景观与厨房扩建",
        },
        description: {
          en: "A redesigned outdoor landscape and an additional rear kitchen to maximize functionality.",
          th: "ออกแบบภูมิทัศน์ภายนอกใหม่ พร้อมต่อเติมครัวหลังบ้านเพื่อเพิ่มฟังก์ชันการใช้งานสูงสุด",
          zh: "重新设计户外景观，并增建后侧厨房以最大化空间功能。",
        },
      },
    ],
  },
  {
    slug: "supalai-107",
    name: "Supalai 107",
    type: {
      en: "Built-In & Interior Fit-Out",
      th: "งานบิ้วท์อินและตกแต่งภายใน",
      zh: "定制家具与室内装修",
    },
    image: "/marketing/project-supalai107.jpg",
    gallery: [
      "/marketing/project-supalai107-dining-close.jpg",
      "/marketing/project-supalai107-living-room-chair.jpg",
      "/marketing/project-supalai107-full-room-wide.jpg",
      "/marketing/project-supalai107-living-room-tv-wall.jpg",
      "/marketing/project-supalai107-living-room-balcony.jpg",
      "/marketing/project-supalai107-full-room-reverse.jpg",
      "/marketing/project-supalai107-sofa-symmetric.jpg",
      "/marketing/project-supalai107-dining-entry.jpg",
      "/marketing/project-supalai107-dining-symmetric.jpg",
    ],
    overview: {
      en: "Built-in furniture and interior fit-out for a 1-bedroom, 1-bathroom unit at Supalai, Room 107 — designed to make the most of a compact footprint with warm wood tones and brass lighting accents.",
      th: "งานบิ้วท์อินและตกแต่งภายในสำหรับคอนโดขนาด 1 ห้องนอน 1 ห้องน้ำ ที่โครงการศุภาลัย ห้อง 107 ออกแบบให้ใช้พื้นที่คุ้มค่า ผสานโทนไม้อบอุ่นและไฟส่องสว่างสไตล์ทองเหลือง",
      zh: "为Supalai公寓107号房（一房一卫）打造的定制家具与室内装修工程，通过温润木质色调与黄铜灯饰细节，充分利用紧凑的空间。",
    },
    highlights: [
      {
        title: {
          en: "Custom Dining & Storage Built-Ins",
          th: "มุมทานอาหารและตู้บิลท์อิน",
          zh: "定制餐厅与收纳柜",
        },
        description: {
          en: "Built-in wood paneling behind the dining area, paired with warm brass pendant lighting for an inviting atmosphere.",
          th: "ผนังไม้บิลท์อินหลังโต๊ะทานอาหาร พร้อมโคมไฟแขวนสไตล์ทองเหลืองที่ให้บรรยากาศอบอุ่น",
          zh: "餐厅背后的定制木饰面墙，搭配温暖的黄铜吊灯，营造温馨氛围。",
        },
      },
      {
        title: {
          en: "Space-Efficient Living Layout",
          th: "ผังห้องนั่งเล่นที่ใช้พื้นที่คุ้มค่า",
          zh: "空间高效的客厅布局",
        },
        description: {
          en: "A curved sofa and functional nesting coffee tables arranged to make the most of the compact floor plan.",
          th: "โซฟาโค้งและโต๊ะกลางฟังก์ชันครบ จัดวางให้เหมาะกับพื้นที่ห้องขนาดกะทัดรัด",
          zh: "弧形沙发与功能性叠放茶几，充分利用紧凑的户型空间。",
        },
      },
      {
        title: {
          en: "Wood Feature Wall with Concealed Lighting",
          th: "ผนังไม้ตกแต่งพร้อมไฟซ่อน",
          zh: "隐藏灯光木饰造型墙",
        },
        description: {
          en: "Slatted wood paneling with hidden LED lighting creates a striking backdrop behind the sofa.",
          th: "ผนังไม้สลิทลายพร้อมไฟ LED ซ่อนแสง สร้างจุดเด่นด้านหลังโซฟา",
          zh: "条纹木饰面墙搭配隐藏式LED灯光，为沙发背景墙增添亮点。",
        },
      },
      {
        title: {
          en: "Built-In TV Console & Utility Nook",
          th: "ตู้ทีวีบิลท์อินและมุมเก็บของ",
          zh: "定制电视柜与家务角落",
        },
        description: {
          en: "A marble-top built-in TV console paired with a neatly concealed laundry and storage nook.",
          th: "ตู้วางทีวีท็อปหินอ่อนบิลท์อิน พร้อมมุมซักล้างที่จัดเก็บอย่างเป็นระเบียบ",
          zh: "大理石台面定制电视柜，搭配整洁收纳的洗衣与储物角落。",
        },
      },
    ],
  },
];
