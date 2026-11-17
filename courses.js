/* =====================================================================
   ข้อมูลรายวิชาทั้งหมด — แก้ไข/เพิ่มรายวิชาได้ที่ไฟล์นี้ (ดูวิธีใน README.md)
   level : "m3" = ม.ต้น , "m6" = ม.ปลาย
   type  : "บังคับ" | "เลือกบังคับ" | "เลือกเสรี"
   canva : ลิงก์ดูสื่อ Canva (แบบ view) — เว้นว่าง "" ถ้ายังไม่มี
   doc   : ลิงก์เอกสาร Google Drive — เว้นว่าง "" ถ้ายังไม่มี
   quiz  : แบบทดสอบ (ใส่ [] ถ้ายังไม่มี) ดูตัวอย่างที่วิชาเศรษฐกิจพอเพียง ม.ต้น
   quizUrl : (ไม่บังคับ) ลิงก์ Google Form ถ้าใช้แบบทดสอบภายนอก
   ===================================================================== */

const LEVELS = {
  m3: { name: "มัธยมศึกษาตอนต้น", short: "ม.ต้น", ic: "🎒", g: ["#e50914", "#5b0309"] },
  m6: { name: "มัธยมศึกษาตอนปลาย", short: "ม.ปลาย", ic: "🎓", g: ["#2563eb", "#0b1f4d"] }
};

/* สีและสาระการเรียนรู้ ตามอักษรนำหน้ารหัสวิชา */
const STRANDS = {
  "ทร": { name: "สาระทักษะการเรียนรู้", g: ["#0e7490", "#03222b"] },
  "พท": { name: "สาระความรู้พื้นฐาน", g: ["#be185d", "#3a0620"] },
  "พต": { name: "สาระความรู้พื้นฐาน", g: ["#c2410c", "#3a1404"] },
  "พค": { name: "สาระความรู้พื้นฐาน", g: ["#4338ca", "#120f3a"] },
  "พว": { name: "สาระความรู้พื้นฐาน", g: ["#0369a1", "#04202f"] },
  "อช": { name: "สาระการประกอบอาชีพ", g: ["#a16207", "#2e1d02"] },
  "ทช": { name: "สาระทักษะการดำเนินชีวิต", g: ["#15803d", "#05250f"] },
  "สค": { name: "สาระการพัฒนาสังคม", g: ["#7c3aed", "#1e0b3d"] }
};

const COURSES = [
/* ===================== ม.ต้น · วิชาบังคับ ===================== */
{level:"m3",type:"บังคับ",code:"ทช21001",name:"เศรษฐกิจพอเพียง",ic:"🌾",
 canva:"https://www.canva.com/design/DAG78IZETfs/wNDJUfdB6AoB_fli6yasMQ/view",
 doc:"https://drive.google.com/file/d/1cUvOniPWCjPdovh2HOgmigeEFVKdV5sJ/view",
 quiz:[
  {q:"หลักปรัชญาของเศรษฐกิจพอเพียงประกอบด้วย 3 ห่วง ข้อใดไม่ใช่หนึ่งใน 3 ห่วง?",o:["ความพอประมาณ","ความมีเหตุผล","การมีภูมิคุ้มกันที่ดี","ความร่ำรวย"],a:3,e:"3 ห่วง ได้แก่ ความพอประมาณ ความมีเหตุผล และการมีภูมิคุ้มกันที่ดีในตัว"},
  {q:"2 เงื่อนไขของหลักปรัชญาของเศรษฐกิจพอเพียงคือข้อใด?",o:["เงินทุนและแรงงาน","ความรู้และคุณธรรม","ที่ดินและเครื่องมือ","เวลาและโอกาส"],a:1,e:"การตัดสินใจและดำเนินกิจกรรมต้องอาศัยเงื่อนไขความรู้ และเงื่อนไขคุณธรรม"},
  {q:"การทำบัญชีรายรับ–รายจ่ายในครัวเรือน สอดคล้องกับหลักใดมากที่สุด?",o:["ความพอประมาณ","การกู้ยืม","การลงทุนเสี่ยงสูง","การบริโภคนิยม"],a:0,e:"การรู้รายรับรายจ่ายช่วยให้ใช้จ่ายพอดีกับฐานะ ไม่เกินตัว คือความพอประมาณ"}
 ]},
{level:"m3",type:"บังคับ",code:"ทช21002",name:"สุขศึกษา",ic:"🩺",
 canva:"https://www.canva.com/design/DAG-diKPDFI/RzExiC8Ux4Q9W4skk3xmSA/view",
 doc:"https://drive.google.com/file/d/1YoVIk2ykz9MbuRhawF4H77aQHd8jVhOH/view",quiz:[]},
{level:"m3",type:"บังคับ",code:"ทช21003",name:"ศิลปศึกษา",ic:"🎨",
 canva:"https://www.canva.com/design/DAG78VjyuKo/67BD3eTGEDHH993-ETVR3g/view",
 doc:"https://drive.google.com/file/d/1Dy1sLyybjCmaLkpByf6YMtK99gAXwDSD/view",quiz:[]},
{level:"m3",type:"บังคับ",code:"ทร21001",name:"ทักษะการเรียนรู้",ic:"📖",
 canva:"https://www.canva.com/design/DAG7jJtnZhA/tmUM70N8FybNi-rnzQoiZw/view",
 doc:"https://drive.google.com/file/d/1A0fmkXhftlqJCzaFZSrHkU_vffqHa5JP/view",quiz:[]},
{level:"m3",type:"บังคับ",code:"พค21001",name:"คณิตศาสตร์",ic:"➗",
 canva:"https://www.canva.com/design/DAG8aJR6ajs/Jb9vyLN5uvIOtonXKIp-tA/view",
 doc:"https://drive.google.com/file/d/1U0LOg7XlI72FpBJfZesuvaINZ8oz-0xb/view",quiz:[]},
{level:"m3",type:"บังคับ",code:"พต21001",name:"ภาษาอังกฤษในชีวิตประจำวัน",ic:"💬",
 canva:"https://www.canva.com/design/DAG7ih6dH9o/Bpw78J5ltUou3IqSYqChzQ/view",
 doc:"https://drive.google.com/file/d/109cb4z1274FcaTyQ2see3WJp6BjIicez/view",quiz:[]},
{level:"m3",type:"บังคับ",code:"พท21001",name:"ภาษาไทย",ic:"✒️",
 canva:"https://www.canva.com/design/DAG90D0O4IA/q8MjV3psUYADhAKTCCd2pA/view",
 doc:"https://drive.google.com/file/d/1GfBR5EJFB4TUtboOom6S5eAJGPpSo_lh/view",quiz:[]},
{level:"m3",type:"บังคับ",code:"พว21001",name:"วิทยาศาสตร์",ic:"🔬",
 canva:"https://www.canva.com/design/DAG7sLzgEYk/NSsh3Ir4Fxw6DGQZuqgAxQ/view",
 doc:"https://drive.google.com/file/d/1Z3Xi9ZmMZh4ZK08BW2Z3jVjX8qJ8URFl/view",quiz:[]},
{level:"m3",type:"บังคับ",code:"สค21001",name:"สังคมศึกษา",ic:"🌏",
 canva:"https://www.canva.com/design/DAG6-SY4mlE/4kt9wHpffiGINKvhp7zjrw/view",
 doc:"https://drive.google.com/file/d/1IvrN02R99wBPxw4V0YLWDJvhW87Gxt2X/view",quiz:[]},
{level:"m3",type:"บังคับ",code:"สค21002",name:"ศาสนาและหน้าที่พลเมือง",ic:"🙏",
 canva:"https://www.canva.com/design/DAG7wZn3SIo/vj-nnitpTyc4vOD4b57XTQ/view",
 doc:"https://drive.google.com/file/d/1Q3btDWdsL69C0yvUCCtpP3afPkxrcHq1/view",quiz:[]},
{level:"m3",type:"บังคับ",code:"สค21003",name:"การพัฒนาตนเอง ชุมชน สังคม",ic:"🤝",
 canva:"https://www.canva.com/design/DAG98MzXfdw/jZ59h7A_c25qCUCjL9c09g/view",
 doc:"https://drive.google.com/file/d/1xUaPLlHofGjfYGOi4XnePyEPRLW6pxxh/view",quiz:[]},
{level:"m3",type:"บังคับ",code:"อช21001",name:"ช่องทางพัฒนาอาชีพ",ic:"🧭",
 canva:"https://www.canva.com/design/DAG7am_hoXw/k3k4ZnNYB3pC7yYyxhErlw/view",
 doc:"https://drive.google.com/file/d/18W6hhwTPDD9MWZc_YmlMxemsYfJOV-Q1/view",quiz:[]},
{level:"m3",type:"บังคับ",code:"อช21002",name:"ทักษะการพัฒนาอาชีพ",ic:"🛠️",
 canva:"https://www.canva.com/design/DAG8iWNjaL4/YNoBpdPj4ffAdsvWhBiHQA/view",
 doc:"https://drive.google.com/file/d/1HYRvQAX9yMCUcVrQzMPS6qxiqXVMm-fC/view",quiz:[]},
{level:"m3",type:"บังคับ",code:"อช21003",name:"พัฒนาอาชีพให้มีความเข้มแข็ง",ic:"💪",
 canva:"https://www.canva.com/design/DAG8lPM-ScY/xVR4-bN1Qe-SPK-tuJC85w/view",
 doc:"https://drive.google.com/file/d/19HaGIPDWC73ptSZ6H8zOI8NpI8VSCWKq/view",quiz:[]},

/* ===================== ม.ต้น · วิชาเลือกบังคับ ===================== */
{level:"m3",type:"เลือกบังคับ",code:"พว22003",name:"วัสดุศาสตร์",ic:"🧪",
 canva:"https://www.canva.com/design/DAG83NBYivw/_K8aw6UDgNkiCxvjNHwrZg/view",
 doc:"https://drive.google.com/file/d/18hcE6_b5iZqk6rXReRDntuGoy4CO-1_7/view",quiz:[]},
{level:"m3",type:"เลือกบังคับ",code:"สค22016",name:"การเงินเพื่อชีวิต 2",ic:"💰",
 canva:"https://www.canva.com/design/DAG-Wx9OVog/e12Tqpz25R9xr8InVyr3Kg/view",
 doc:"https://drive.google.com/file/d/1jX4FnNDf7B1wBP0aIquO7_OkAyIrwqHC/view",quiz:[]},
{level:"m3",type:"เลือกบังคับ",code:"สค22019",name:"การเรียนรู้สู้ภัยธรรมชาติ 2",ic:"🌪️",
 canva:"https://www.canva.com/design/DAG7i0Q7m_I/ZjlRWl8QcOsASCkY-IL-Nw/view",
 doc:"https://drive.google.com/file/d/1IaKfwTSfKCWu3xNldpG-ys1gIT_YT0D2/view",quiz:[]},
{level:"m3",type:"เลือกบังคับ",code:"พว22002",name:"การใช้พลังงานไฟฟ้าในชีวิตประจำวัน",ic:"⚡",
 canva:"https://www.canva.com/design/DAG_awAXHLw/NobRCaUkza-_D3QLG4Fn_Q/view",
 doc:"https://drive.google.com/file/d/1lSug4ZDvFTpzgCx9efDxSxwc15w96KVl/view",quiz:[]},
{level:"m3",type:"เลือกบังคับ",code:"สค22020",name:"ประวัติศาสตร์ชาติไทย",ic:"📜",
 canva:"https://www.canva.com/design/DAG64xDcBjg/JYc1gThzc00D_OtZswcemA/view",
 doc:"https://drive.google.com/file/d/1NzzIPL50tSjFa27FDgO8jXmXvi6tMkrx/view",quiz:[]},

/* ===================== ม.ต้น · วิชาเลือกเสรี ===================== */
{level:"m3",type:"เลือกเสรี",code:"สค22022",name:"การป้องกันการทุจริต",ic:"🛡️",
 canva:"https://www.canva.com/design/DAG7UjshTHg/ez52y85anNNvgypm9e9qHA/view",
 doc:"https://drive.google.com/file/d/12UqMO54OhBoPV835kFgZbtfzzV74qFI5/view",quiz:[]},
{level:"m3",type:"เลือกเสรี",code:"สค2300122",name:"TO BE NUMBER ONE เป็นหนึ่งโดยไม่พึ่งยาเสพติด",ic:"⭐",
 canva:"https://www.canva.com/design/DAG70kOCzs0/L9uONsIvL-wotik0Y7qc6w/view",
 doc:"",quiz:[]},
{level:"m3",type:"เลือกเสรี",code:"สค23123",name:"นครศรีธรรมราชศึกษา",ic:"🛕",
 canva:"https://www.canva.com/design/DAG650DN0Bc/oTzwk-DcDSTClPrE4t-vyg/view",
 doc:"",quiz:[]},
{level:"m3",type:"เลือกเสรี",code:"สค0200038",name:"กฎหมายที่ควรรู้คู่โลกออนไลน์",ic:"⚖️",
 canva:"https://www.canva.com/design/DAG9kVFCv2I/CHsRccl0laHs3SYfyipPng/view",
 doc:"",quiz:[]},

/* ===================== ม.ปลาย · วิชาบังคับ ===================== */
{level:"m6",type:"บังคับ",code:"ทช31001",name:"เศรษฐกิจพอเพียง",ic:"🌾",canva:"https://www.canva.com/design/DAG8boquPgo/KRVdivNnu7X3RFU8xwvvRA/view",
 doc:"https://drive.google.com/file/d/1kp3xdLsFPIj_OFpVugQlW5ZYl2qABGsx/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"ทช31002",name:"สุขศึกษา",ic:"🩺",canva:"https://www.canva.com/design/DAG7Q0kjIm8/H0xnt4Ikr_95QyT4osBxPA/view",
 doc:"https://drive.google.com/file/d/1qYdh1HLVoavXUnyCvwnVFllv9xod71t5/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"ทช31003",name:"ศิลปศึกษา",ic:"🎨",canva:"https://www.canva.com/design/DAG8k4wl3WE/0v_FCgBnceIBMyzN9X3UuA/view",
 doc:"https://drive.google.com/file/d/1sdEaY0ijfkFxKeHrlYleyuQA0MCcOyAb/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"ทร31001",name:"ทักษะการเรียนรู้",ic:"📖",canva:"https://www.canva.com/design/DAG90ARUXfg/fg4pfr3u4unkJhQram9y8Q/view",
 doc:"https://drive.google.com/file/d/1ou28qMBX9Y9RXJK5QXA9vDTIoB69OAxp/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"พค31001",name:"คณิตศาสตร์",ic:"➗",canva:"https://www.canva.com/design/DAG90YHoZuQ/JWBqutYUMI66kvRgXJtCjQ/view",
 doc:"https://drive.google.com/file/d/1OpuAG3tbK5uTn6J4SZJFIzQEG_ex6Q6e/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"พต31001",name:"ภาษาอังกฤษในชีวิตประจำวัน",ic:"💬",canva:"https://www.canva.com/design/DAG9ecGFnLg/IUifUFdzq6pRnHB4-9ZPrg/view",
 doc:"https://drive.google.com/file/d/1DWIa1nfqLDX0ah9Chwmp4nTDUSoSpBiq/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"พท31001",name:"ภาษาไทย",ic:"✒️",canva:"https://www.canva.com/design/DAG8CxNlzlQ/5NSlRg5s0bGWGj5hVuK0yw/view",
 doc:"https://drive.google.com/file/d/1EcOiqVbr_TWLFXFYr-HLwiWQ2Wm3WWEv/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"พว31001",name:"วิทยาศาสตร์",ic:"🔬",canva:"https://www.canva.com/design/DAG7QiF23Pc/cTrUCTg1MTMmd5BwcDLbVQ/view",
 doc:"https://drive.google.com/file/d/1k7IPwby4IWQcFFL0GTf7NylecttzM92P/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"สค31001",name:"สังคมศึกษา",ic:"🌏",canva:"https://www.canva.com/design/DAG-WwZxBNk/X7Bl2aD5S4W4sk5VvM0tlw/view",
 doc:"https://drive.google.com/file/d/1g06IstecAbMmZtoFDC2jLalns5ADjl_T/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"สค31002",name:"ศาสนาและหน้าที่พลเมือง",ic:"🙏",canva:"https://www.canva.com/design/DAG7iaLUhoQ/1Lg-yvEW7mxcSPDefLFvaQ/view",
 doc:"https://drive.google.com/file/d/1NiymePrCm3z4AsMMPyx0jwK9HSQNn1ZH/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"สค31003",name:"การพัฒนาตนเอง ชุมชน สังคม",ic:"🤝",canva:"https://www.canva.com/design/DAG6-5wKuJU/-UFwJ0i_1Ycyksuex2TgVA/view",
 doc:"https://drive.google.com/file/d/1mhtlWCF3uXlGCuKXqhXHTC8BFowuf-8J/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"อช31001",name:"ช่องทางพัฒนาอาชีพ",ic:"🧭",canva:"https://www.canva.com/design/DAG98BYL1o4/BZie0J6ozvKtCGHRStN5gg/view",
 doc:"https://drive.google.com/file/d/1gOA1d3Cdh0KUPTO4VTNYbPHpgZjqv4rx/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"อช31002",name:"ทักษะการขยายอาชีพ",ic:"📈",canva:"https://www.canva.com/design/DAG6_zkMRWI/I9FwqxliNRs0rNJVdKWjKw/view",
 doc:"https://drive.google.com/file/d/1heTdQDbKWfELmMaimbPXvjN848N_gWdw/view",quiz:[]},
{level:"m6",type:"บังคับ",code:"อช31003",name:"พัฒนาอาชีพให้มีความมั่นคง",ic:"🏛️",canva:"https://www.canva.com/design/DAG8lCPqGtk/pBJwr6GtbfNdOnaO8Kw6AA/view",
 doc:"https://drive.google.com/file/d/1KJGorYDksE3_C5VgGiphkdDcAPMNinlk/view",quiz:[]},

/* ===================== ม.ปลาย · วิชาเลือกบังคับ ===================== */
{level:"m6",type:"เลือกบังคับ",code:"พว22003",name:"วัสดุศาสตร์",ic:"🧪",canva:"",
 doc:"https://drive.google.com/file/d/18hcE6_b5iZqk6rXReRDntuGoy4CO-1_7/view",quiz:[]},
{level:"m6",type:"เลือกบังคับ",code:"สค32029",name:"การเงินเพื่อชีวิต 3",ic:"💰",canva:"https://www.canva.com/design/DAG-SdEmUsA/rXHC8qTQ1NYp4HT1XUFoMg/view",
 doc:"https://drive.google.com/file/d/19l_1VZOTgJO20CCKsfu51LWmRwpvfGon/view",quiz:[]},
{level:"m6",type:"เลือกบังคับ",code:"สค32032",name:"การเรียนรู้สู้ภัยธรรมชาติ 3",ic:"🌪️",canva:"https://www.canva.com/design/DAG8mMQ0W_E/ABZ7bmZnrgCkqI6jUiNEIQ/view",
 doc:"https://drive.google.com/file/d/1guwPlfVTx03Okb-lcmJuIMeRK6_ptfXi/view",quiz:[]},
{level:"m6",type:"เลือกบังคับ",code:"พว32023",name:"การใช้พลังงานไฟฟ้าในชีวิตประจำวัน 3",ic:"⚡",canva:"https://www.canva.com/design/DAG9chxKEwE/Hq1kziMAi7-qjXblCmeRlA/view",
 doc:"https://drive.google.com/file/d/1jKGpPJFl3oMhDgELHzGQb44ovo_7c-hC/view",quiz:[]},
{level:"m6",type:"เลือกบังคับ",code:"สค32034",name:"ประวัติศาสตร์ชาติไทย",ic:"📜",canva:"https://www.canva.com/design/DAG-sjNFUpk/yaSZpPwyvAhfjFAYfP6F4Q/view",
 doc:"https://drive.google.com/file/d/1gQ3zuSolcS0cgj_DwxhaKRzGXoANB41D/view",quiz:[]},

/* ===================== ม.ปลาย · วิชาเลือกเสรี ===================== */
{level:"m6",type:"เลือกเสรี",code:"สค32036",name:"การป้องกันการทุจริต",ic:"🛡️",canva:"https://www.canva.com/design/DAG-yWQrF8c/MK-jGeXVD3TsStaxLz29iA/view",
 doc:"https://drive.google.com/file/d/1ozyJ3jVCGZzK_yvAEcOYgBhWCdYEHEX6/view",quiz:[]},
{level:"m6",type:"เลือกเสรี",code:"สค3300166",name:"TO BE NUMBER ONE เป็นหนึ่งโดยไม่พึ่งยาเสพติด",ic:"⭐",
 canva:"https://www.canva.com/design/DAG_EA4MkWg/7rua25xTkDMGdLodK1SY2g/view",
 doc:"",quiz:[]},
{level:"m6",type:"เลือกเสรี",code:"สค3300168",name:"นครศรีธรรมราชศึกษา",ic:"🛕",
 canva:"https://www.canva.com/design/DAG86Jm8J8k/R8BZLJydhXkn1RBzgWHBtQ/view",
 doc:"",quiz:[]},
{level:"m6",type:"เลือกเสรี",code:"สค0200038",name:"กฎหมายที่ควรรู้คู่โลกออนไลน์",ic:"⚖️",
 canva:"https://www.canva.com/design/DAG9kVFCv2I/CHsRccl0laHs3SYfyipPng/view",
 doc:"",quiz:[]},
{level:"m6",type:"เลือกเสรี",code:"สค32025",name:"กฎหมายพื้นฐานในการดำรงชีวิต",ic:"📘",
 canva:"https://www.canva.com/design/DAG9nGtgcVU/o8JZT6LwTR5ASfIAAtxcEg/view",
 doc:"",quiz:[]}
];
