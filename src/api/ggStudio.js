import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (API_KEY) {
    console.log("[Gemini] API key loaded:", API_KEY.slice(0, 8) + "...");
} else {
    console.warn(
        "[Gemini] No API key found (VITE_GEMINI_API_KEY). Using mock data.",
    );
}

let _client = null;
function getClient() {
    if (!_client && API_KEY) _client = new GoogleGenerativeAI(API_KEY);
    return _client;
}

function getModel() {
    const c = getClient();
    if (!c) return null;
    return c.getGenerativeModel({ model: "gemini-flash-latest" });
}

async function callGemini(parts) {
    const model = getModel();
    if (!model) {
        console.warn(
            "[Gemini] No client — using mock. Check VITE_GEMINI_API_KEY in .env",
        );
        return null;
    }
    const result = await model.generateContent(parts);
    return result.response.text();
}

function safeJSON(text) {
    if (!text) return null;
    try {
        const cleaned = text
            .replace(/^```json\s*/im, "")
            .replace(/^```\s*/im, "")
            .replace(/\s*```\s*$/im, "")
            .trim();
        return JSON.parse(cleaned);
    } catch {
        return null;
    }
}

// ─── IMAGE ANALYSIS ─────────────────────────────────────────────────────────

export async function analyzeImage(base64Data, mimeType = "image/jpeg") {
    const parts = [
        { inlineData: { data: base64Data, mimeType } },
        `Bạn là chuyên gia phân tích hình ảnh cho sản xuất video quảng cáo chuyên nghiệp.
Phân tích hình ảnh này chi tiết. Trả về ĐÚNG một JSON object (không có markdown code block):
{
  "description": "mô tả chi tiết bằng tiếng Việt về nội dung hình ảnh",
  "character": { "gender": "...", "age": "...", "hair": "...", "outfit": "...", "expression": "..." },
  "setting": { "location": "...", "lighting": "...", "mood": "..." },
  "tags": ["tag1","tag2","tag3"],
  "colors": ["color1","color2"],
  "suggested_prompt": "English prompt for image/video generation based on this image, ultra detailed"
}`,
    ];
    try {
        const text = await callGemini(parts);
        const json = safeJSON(text);
        if (json) return json;
        console.warn(
            "[Gemini analyzeImage] Could not parse JSON response:",
            text?.slice(0, 200),
        );
    } catch (err) {
        console.error(
            "[Gemini analyzeImage] API error — falling back to mock:",
            err?.message || err,
        );
    }
    return analyzeImageMock();
}

// ─── PROMPT GENERATION ──────────────────────────────────────────────────────

export async function generatePrompts(inputs) {
    const {
        imageAnalysis,
        imageDescription,
        textInput,
        style = "Cinematic",
        promptType = "image",
        detailLevel = "detailed",
        additionalRequirements = "",
    } = inputs;

    const context = [
        imageAnalysis?.description || imageDescription || "",
        imageAnalysis?.suggested_prompt || "",
        textInput || "",
    ]
        .filter(Boolean)
        .join("\n");

    const parts = [
        `Bạn là chuyên gia tạo prompt cho AI image/video generation chuyên nghiệp.

Context: ${context || "Tạo nội dung video quảng cáo chuyên nghiệp"}
Style: ${style}
Prompt type: ${promptType}
Detail level: ${detailLevel}
Additional: ${additionalRequirements || "none"}

Tạo prompt chuyên nghiệp cho sản xuất video.
Trả về ĐÚNG một JSON (không có markdown):
{
  "mainPrompt": "detailed English prompt for image/video generation",
  "negativeHint": "negative prompt keywords separated by commas",
  "camera": "camera setup and movement",
  "lighting": "lighting description",
  "motion": "motion and movement description",
  "consistencyRules": ["rule1","rule2","rule3"]
}`,
    ];
    try {
        const text = await callGemini(parts);
        const json = safeJSON(text);
        if (json) return json;
        console.warn(
            "[Gemini generatePrompts] Could not parse JSON:",
            text?.slice(0, 200),
        );
    } catch (err) {
        console.error(
            "[Gemini generatePrompts] API error — falling back to mock:",
            err?.message || err,
        );
    }
    return generatePromptsMock(inputs);
}

// ─── SCRIPT GENERATION ──────────────────────────────────────────────────────

export async function generateScript(inputs) {
    const {
        imageAnalysis,
        imageDescription,
        textInput,
        generatedPrompts,
        style = "Cinematic",
        videoStyle = "tvc",
        sceneCount = 6,
        duration = 30,
        language = "vietnamese",
        includeDialogue = true,
    } = inputs;

    const langMap = {
        vietnamese: "Tiếng Việt",
        english: "English",
        bilingual: "song ngữ Việt-Anh",
    };
    const styleMap = {
        tvc: "TVC Quảng cáo chuyên nghiệp",
        tiktok: "Viral TikTok ngắn",
        review: "Review sản phẩm",
        fashion: "Fashion Lookbook",
        emotional: "Kể chuyện cảm xúc",
        luxury: "Sang trọng cao cấp",
        beforeafter: "Before/After Transformation",
        ugc: "UGC Quảng cáo tự nhiên",
        tutorial: "Hướng dẫn sử dụng",
        drama: "Drama ngắn",
    };

    const context = [
        textInput ? `Ý tưởng/Sản phẩm: ${textInput}` : "",
        imageAnalysis?.description || imageDescription || "",
        generatedPrompts?.mainPrompt
            ? `Visual style: ${generatedPrompts.mainPrompt.slice(0, 150)}`
            : "",
    ]
        .filter(Boolean)
        .join("\n");

    const durationPerScene = Math.round(duration / sceneCount);

    const parts = [
        `Bạn là biên kịch video chuyên nghiệp với kinh nghiệm làm quảng cáo thương mại.

Context: ${context || "Video quảng cáo sản phẩm chuyên nghiệp"}
Phong cách video: ${styleMap[videoStyle] || videoStyle}
Visual style: ${style}
Thời lượng: ${duration} giây
Số cảnh: ${sceneCount} cảnh (mỗi cảnh ~${durationPerScene}s)
Ngôn ngữ kịch bản: ${langMap[language] || "Tiếng Việt"}
Có lời thoại/voiceover: ${includeDialogue ? "Có" : "Không"}

Viết kịch bản video chuyên nghiệp, hấp dẫn, phù hợp thị trường Việt Nam.
Trả về ĐÚNG một JSON (không có markdown):
{
  "title": "tiêu đề video ấn tượng",
  "hook": "câu mở đầu gây chú ý mạnh",
  "scenes": [
    {
      "id": 1,
      "duration": "${durationPerScene}s",
      "description": "mô tả hình ảnh cảnh này bằng tiếng Việt",
      "action": "hành động của nhân vật/sản phẩm",
      "dialogue": ${includeDialogue ? '"lời thoại hoặc voiceover bằng tiếng Việt"' : "null"},
      "imagePrompt": "English image generation prompt for this scene, ultra detailed, cinematic",
      "videoPrompt": "English video motion prompt for this scene",
      "camera": "góc máy và chuyển động camera",
      "setting": "bối cảnh và môi trường"
    }
  ],
  "cta": "lời kêu gọi hành động cuối video"
}

Tạo ĐÚNG ${sceneCount} cảnh.`,
    ];
    try {
        const text = await callGemini(parts);
        const json = safeJSON(text);
        if (json?.scenes?.length) return json;
        console.warn(
            "[Gemini generateScript] Bad response:",
            text?.slice(0, 200),
        );
    } catch (err) {
        console.error(
            "[Gemini generateScript] API error — falling back to mock:",
            err?.message || err,
        );
    }
    return generateScriptMock(inputs);
}

// ─── STORYBOARD GENERATION ──────────────────────────────────────────────────

export async function generateStoryboard(inputs) {
    const { script, panelCount = 6, aspectRatio = "9:16" } = inputs;

    if (!script?.scenes) return generateStoryboardMock(inputs);

    const scenesText = script.scenes
        .map(
            (s, i) =>
                `Cảnh ${i + 1}: ${s.description} | Action: ${s.action} | Camera: ${s.camera}`,
        )
        .join("\n");

    const parts = [
        `Bạn là storyboard artist chuyên nghiệp.

Script title: ${script.title || "Video"}
Scenes:
${scenesText}

Tạo storyboard chi tiết với ${panelCount} panels, tỷ lệ ${aspectRatio}.
Trả về ĐÚNG một JSON (không có markdown):
{
  "panels": [
    {
      "id": 1,
      "sceneRef": 1,
      "description": "mô tả hình ảnh chi tiết",
      "cameraAngle": "góc camera",
      "characterPose": "tư thế nhân vật",
      "action": "hành động chính",
      "setting": "bối cảnh",
      "lighting": "ánh sáng",
      "imagePrompt": "English image generation prompt ultra detailed",
      "notes": "ghi chú kỹ thuật"
    }
  ],
  "continuityRules": ["rule1","rule2"]
}`,
    ];
    try {
        const text = await callGemini(parts);
        const json = safeJSON(text);
        if (json?.panels?.length) return json;
        console.warn(
            "[Gemini generateStoryboard] Bad response:",
            text?.slice(0, 200),
        );
    } catch (err) {
        console.error(
            "[Gemini generateStoryboard] API error — falling back to mock:",
            err?.message || err,
        );
    }
    return generateStoryboardMock(inputs);
}

// ─── VIDEO PROMPT GENERATION ─────────────────────────────────────────────────

export async function generateVideoPrompt(inputs) {
    const {
        script,
        storyboard,
        generatedPrompts,
        mode = "imageToVideo",
        cameraMovement = "slow-push",
        motionStyle = "natural",
        imageAnalysis,
    } = inputs;

    const context = [
        script?.title || "Video production",
        script?.scenes ? `${script.scenes.length} scenes` : "",
        generatedPrompts?.mainPrompt?.slice(0, 200) || "",
        imageAnalysis?.description || "",
    ]
        .filter(Boolean)
        .join("\n");

    const parts = [
        `Bạn là chuyên gia tạo video prompt cho AI video generation (Runway, Kling, Sora).

Mode: ${mode}
Camera movement: ${cameraMovement}
Motion style: ${motionStyle}
Context: ${context}

${
    storyboard?.panels
        ? `Storyboard panels: ${storyboard.panels
              .slice(0, 3)
              .map((p) => p.description)
              .join(" | ")}`
        : ""
}

Tạo video prompt chuyên nghiệp.
Trả về ĐÚNG một JSON (không có markdown):
{
  "videoPrompt": "full main English video prompt for the entire video",
  "scenePrompts": [
    {
      "scene": 1,
      "prompt": "English motion prompt for this scene",
      "cameraMove": "specific camera movement",
      "duration": "Xs",
      "transition": "transition type to next scene"
    }
  ],
  "cameraInstructions": "overall camera direction",
  "characterMovement": "character movement guidelines",
  "timingNotes": "timing and pacing notes",
  "antiErrorRules": ["rule to prevent common AI video errors"]
}`,
    ];
    try {
        const text = await callGemini(parts);
        const json = safeJSON(text);
        if (json?.videoPrompt) return json;
        console.warn(
            "[Gemini generateVideoPrompt] Bad response:",
            text?.slice(0, 200),
        );
    } catch (err) {
        console.error(
            "[Gemini generateVideoPrompt] API error — falling back to mock:",
            err?.message || err,
        );
    }
    return generateVideoPromptMock(inputs);
}

// ─── NEGATIVE PROMPT GENERATION ─────────────────────────────────────────────

export async function generateNegativePrompt(inputs) {
    const { imageAnalysis, script, generatedPrompts, videoStyle } = inputs;

    const context =
        imageAnalysis?.description || script?.title || "video production";

    const parts = [
        `Bạn là chuyên gia negative prompt cho AI image/video generation.

Context: ${context}
Video style: ${videoStyle || "commercial"}
Character details: ${JSON.stringify(imageAnalysis?.character || {})}

Tạo negative prompt toàn diện để tránh các lỗi phổ biến.
Trả về ĐÚNG một JSON (không có markdown):
{
  "negativePrompt": "comprehensive English negative prompt keywords, comma separated",
  "identityLock": ["rule to maintain character consistency"],
  "productLock": ["rule to maintain product consistency"],
  "backgroundLock": ["rule to maintain background consistency"],
  "motionStabilityRules": ["rule to prevent video artifacts"],
  "qualityRules": ["quality enforcement rules"]
}`,
    ];
    try {
        const text = await callGemini(parts);
        const json = safeJSON(text);
        if (json?.negativePrompt) return json;
        console.warn(
            "[Gemini generateNegativePrompt] Bad response:",
            text?.slice(0, 200),
        );
    } catch (err) {
        console.error(
            "[Gemini generateNegativePrompt] API error — falling back to mock:",
            err?.message || err,
        );
    }
    return generateNegativePromptMock(inputs);
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

export function analyzeImageMock() {
    return {
        description:
            "Người phụ nữ trẻ khoảng 22–25 tuổi, tóc đen dài mềm mại, mặc áo sơ mi trắng tinh tế phong cách tối giản. Đứng trong không gian studio hiện đại với ánh sáng tự nhiên ấm áp từ cửa sổ lớn bên trái. Biểu cảm tự tin, nhẹ nhàng và cuốn hút.",
        character: {
            gender: "female",
            age: "22–25",
            hair: "black, long, soft waves",
            outfit: "white minimalist shirt, clean aesthetic",
            expression: "confident, natural, approachable",
        },
        setting: {
            location: "modern minimalist studio",
            lighting: "natural daylight from left window, warm 4500K",
            mood: "aspirational, clean, premium",
        },
        tags: [
            "portrait",
            "lifestyle",
            "studio",
            "natural light",
            "fashion",
            "minimal",
        ],
        colors: ["white", "warm golden", "soft gray", "skin tone"],
        suggested_prompt:
            "Elegant young Vietnamese woman, white minimalist outfit, bright modern studio, natural warm window light, Korean drama aesthetic, ultra-sharp 8K portrait photography, shallow depth of field f/1.8, cinematic color grading, professional commercial photography",
    };
}

export function generatePromptsMock(inputs = {}) {
    const style = inputs.style || "Cinematic";
    return {
        mainPrompt: `Elegant Vietnamese woman in ${style.toLowerCase()} style, wearing white minimalist outfit, standing in bright modern studio environment. Natural warm sunlight streaming from large windows, soft shadows, Korean drama color grading. Ultra-sharp 8K portrait photography, shallow depth of field, professional commercial quality. Clean background, aspirational lifestyle aesthetic.`,
        negativeHint:
            "blurry, distorted, lowres, watermark, extra fingers, bad anatomy, disfigured face, missing limbs, ugly, mutation, poorly drawn, bad proportions",
        camera: "Medium shot to close-up, 85mm lens, f/1.8, shallow DOF, slight dutch angle for dynamism",
        lighting:
            "Soft natural key light from window (left), subtle fill reflector (right), warm color temperature 4500K, no harsh shadows",
        motion: "Gentle slow push-in 10%, smooth dolly movement, subtle handheld breathing effect",
        consistencyRules: [
            "Maintain same face, hair color and style throughout all scenes",
            "Keep white outfit consistent in all frames — no color shift",
            "Same warm lighting tone and direction in all scenes",
            "Background remains consistent modern studio aesthetic",
            "Character skin tone stays natural and warm throughout",
        ],
    };
}

export function generateScriptMock(inputs = {}) {
    const style = inputs.videoStyle || "tvc";
    const lang = inputs.language || "vietnamese";
    const count = inputs.sceneCount || 6;
    const dur = inputs.duration || 30;
    const perScene = Math.round(dur / count);

    const isTVC = style === "tvc" || style === "luxury";
    const title = isTVC ? "Khoảnh Khắc Tỏa Sáng" : "Bí Quyết Của Tôi";
    const hook = isTVC
        ? "Vẻ đẹp thật sự không cần cố gắng... khi bạn tìm đúng bí quyết."
        : "Okay nhưng cái này chill thật sự 😍";

    const scenes = [
        {
            id: 1,
            duration: `${perScene}s`,
            description:
                "Close-up gương mặt sáng rạng, ánh sáng buổi sáng nhẹ nhàng, biểu cảm trăn trở nhẹ",
            action: "Nhân vật chậm rãi chạm nhẹ vào má, nhìn thẳng vào camera",
            dialogue:
                lang !== "english"
                    ? "Mỗi sáng thức dậy, tôi chỉ muốn một điều..."
                    : "Every morning I wake up wanting just one thing...",
            imagePrompt:
                "Close-up portrait of beautiful Vietnamese woman, morning light, gentle expression, touching cheek softly, warm skin tone, ultra realistic, 8K, cinematic color grading, bokeh background",
            videoPrompt:
                "Extreme slow zoom into face, soft morning glow, intimate camera movement, shallow DOF pull focus, 24fps cinematic",
            camera: "ECU to CU, 135mm, f/1.4, shallow DOF",
            setting: "Minimalist bedroom, morning, soft light",
        },
        {
            id: 2,
            duration: `${perScene}s`,
            description:
                "Sản phẩm được đặt trên mặt phẳng cẩm thạch trắng, ánh sáng studio sang trọng",
            action: "Bàn tay nhẹ nhàng cầm sản phẩm, xoay nhẹ để thấy nhãn hiệu",
            dialogue:
                lang !== "english"
                    ? "Cho đến khi tôi tìm được thứ này..."
                    : "Until I found this...",
            imagePrompt:
                "Luxury product on white marble surface, studio lighting, elegant hands holding product, brand label visible, soft shadows, commercial photography quality, 8K",
            videoPrompt:
                "Slow product reveal, gentle 360 rotation, studio light glint effect, hands entering frame naturally, luxurious movement",
            camera: "Product macro, 60mm macro lens, dramatic lighting",
            setting: "White marble studio, premium lighting",
        },
        {
            id: 3,
            duration: `${perScene}s`,
            description:
                "Nhân vật sử dụng sản phẩm, biểu cảm thư giãn và hài lòng",
            action: "Nhẹ nhàng thoa sản phẩm lên da, nhắm mắt hưởng thụ",
            dialogue:
                lang !== "english"
                    ? "Cảm giác này... không có gì sánh bằng."
                    : "This feeling... nothing compares.",
            imagePrompt:
                "Woman applying skincare product, eyes closed in pleasure, warm bathroom lighting, reflection in mirror, natural skin texture, photorealistic",
            videoPrompt:
                "Close-up hands applying product, skin texture macro shot, blissful expression close-up, slow motion application, warm intimate lighting",
            camera: "CU hands and face, alternating",
            setting: "Bright bathroom, warm morning light",
        },
        {
            id: 4,
            duration: `${perScene}s`,
            description:
                "Kết quả trước và sau — làn da căng mịn, rạng rỡ tự nhiên",
            action: "Nhân vật nhìn vào gương, mỉm cười thỏa mãn khi thấy kết quả",
            dialogue:
                lang !== "english"
                    ? "Chỉ 7 ngày. Nhìn mà xem."
                    : "Just 7 days. Look at this.",
            imagePrompt:
                "Before after transformation, glowing healthy skin, natural radiance, mirror reflection, happy confident expression, bright bathroom setting, 8K portrait",
            videoPrompt:
                "Reveal shot — camera pulls back from mirror, character smiles at reflection, warm golden light floods room, hopeful uplifting moment",
            camera: "Medium shot via mirror reflection",
            setting: "Bathroom mirror, morning golden light",
        },
        {
            id: 5,
            duration: `${perScene}s`,
            description:
                "Nhân vật ra ngoài tự tin, phong cách, làn da tỏa sáng dưới nắng",
            action: "Bước đi tự tin trên phố, tóc bay nhẹ, ánh nắng chiếu lên gương mặt rạng ngời",
            dialogue:
                lang !== "english"
                    ? "Khi bạn cảm thấy tốt, bạn tỏa sáng."
                    : "When you feel good, you glow.",
            imagePrompt:
                "Confident beautiful Vietnamese woman walking outdoors, sunlight on glowing skin, hair flowing, urban background, golden hour lighting, fashion editorial photography",
            videoPrompt:
                "Slow motion walk toward camera, golden hour backlight, hair movement, confident stride, city backdrop softly blurred, cinematic tracking shot",
            camera: "Low angle tracking shot, golden hour",
            setting: "Urban street, golden hour",
        },
        {
            id: 6,
            duration: `${perScene}s`,
            description: "Sản phẩm hiển thị cùng logo thương hiệu, CTA nổi bật",
            action: "Sản phẩm đặt đẹp với thông tin ưu đãi, nhân vật vẫy tay vui vẻ",
            dialogue:
                lang !== "english"
                    ? "Thử ngay hôm nay — link trong bio, giảm 30%!"
                    : "Try it today — link in bio, 30% off!",
            imagePrompt:
                "Product showcase with brand logo, promotional offer text overlay, happy character in background, clean commercial composition, high-end advertising aesthetic",
            videoPrompt:
                "Product float-in animation, text reveal effect, character waves goodbye playfully, brand logo fade in, upbeat ending",
            camera: "Wide product shot to close CTA",
            setting: "Clean studio background",
        },
    ].slice(0, count);

    return {
        title,
        hook,
        scenes,
        cta: "Mua ngay tại link trong bio | Ưu đãi 30% chỉ hôm nay!",
    };
}

export function generateStoryboardMock(inputs = {}) {
    const count = inputs.panelCount || 6;
    const ratio = inputs.aspectRatio || "9:16";
    const scenes = inputs.script?.scenes || [];

    const panels = Array.from({ length: count }, (_, i) => {
        const scene = scenes[i] || {};
        return {
            id: i + 1,
            sceneRef: i + 1,
            description:
                scene.description ||
                `Cảnh ${i + 1}: Nhân vật trong khung hình ${ratio}, ánh sáng cinematic, bố cục hài hòa`,
            cameraAngle: [
                "ECU — Extreme Close-up",
                "CU — Close-up",
                "MCU — Medium Close-up",
                "MS — Medium Shot",
                "LS — Long Shot",
                "BCU — Bird-eye",
            ][i % 6],
            characterPose: [
                "Nhìn thẳng camera, tự tin",
                "Nghiêng nhẹ 3/4 về phải",
                "Side profile thanh thoát",
                "Ngồi thư giãn",
                "Đứng thẳng, tay tự nhiên",
                "Bước đi tự nhiên",
            ][i % 6],
            action: scene.action || "Hành động tự nhiên, không gượng gạo",
            setting: scene.setting || "Studio tối giản, ánh sáng chuyên nghiệp",
            lighting: [
                "Soft natural light",
                "Warm studio key light",
                "Golden hour backlight",
                "Fill light for product",
                "Dramatic side light",
                "Clean flat light",
            ][i % 6],
            imagePrompt:
                scene.imagePrompt ||
                `Panel ${i + 1}: ${["ECU portrait", "Product close-up", "Application detail", "Reveal shot", "Outdoor confidence", "Brand CTA"][i % 6]}, professional commercial photography, 8K, cinematic`,
            notes: [
                "Giữ nguyên màu tóc và trang phục",
                "Ánh sáng sản phẩm đồng đều 360°",
                "Biểu cảm tự nhiên không cứng",
                "Bố cục theo quy tắc 1/3",
                "Maintain skin tone consistency",
                "Clear brand visibility",
            ][i % 6],
        };
    });

    return {
        panels,
        continuityRules: [
            "Giữ nguyên màu tóc, kiểu tóc trong tất cả panels",
            "Trang phục nhất quán — không thay đổi chi tiết",
            "Tone màu skin nhất quán — warm, natural",
            "Sản phẩm phải hiển thị rõ ràng và nhất quán",
            "Background style phải đồng nhất trong cùng một cảnh",
        ],
    };
}

export function generateVideoPromptMock(inputs = {}) {
    const mode = inputs.mode || "imageToVideo";
    const motion = inputs.motionStyle || "natural";
    const camera = inputs.cameraMovement || "slow-push";

    const modeMap = {
        imageToVideo: "image-to-video cinematic conversion",
        storyboardToVideo: "storyboard animation sequence",
        fashionLookbook: "fashion lookbook motion editorial",
        productCommercial: "product commercial motion",
        beforeAfter: "transformation reveal effect",
    };

    return {
        videoPrompt: `Professional ${modeMap[mode] || mode} video, ${motion} movement style. ${camera === "slow-push" ? "Gentle slow push-in camera movement" : camera === "dolly" ? "Smooth cinematic dolly movement" : "Static stable camera"}. Maintain character identity and product consistency throughout. Korean drama color grade, warm cinematic tone. Ultra smooth 60fps interpolation. No flickering, no artifacts, stable background. Professional advertising quality.`,
        scenePrompts: (inputs.script?.scenes || Array(3).fill({}))
            .slice(0, 6)
            .map((s, i) => ({
                scene: i + 1,
                prompt:
                    s.videoPrompt ||
                    `Scene ${i + 1}: ${["Intimate close-up reveal, slow zoom", "Product beauty shot, 360 rotation effect", "Application texture macro, slow motion", "Transformation reveal, hopeful energy", "Confident outdoor walk, golden backlight", "Brand CTA, product float animation"][i % 6]}. Smooth motion, cinematic grade.`,
                cameraMove: [
                    "Slow push-in 5%",
                    "Orbit around product",
                    "Rack focus foreground to background",
                    "Pull back reveal",
                    "Low angle tracking",
                    "Static with subject motion",
                ][i % 6],
                duration: s.duration || "5s",
                transition: [
                    "Dissolve",
                    "Cut",
                    "Fade to white",
                    "Wipe",
                    "Match cut",
                    "Fade out",
                ][i % 6],
            })),
        cameraInstructions:
            "All movements smooth and intentional. No sudden jumps. Prefer slow deliberate movements. Handheld should have subtle breathing, not shaky.",
        characterMovement:
            "Natural, fluid. No robotic movements. Maintain facial identity. Hair can move naturally with environment.",
        timingNotes:
            "Slow scenes for product beauty shots. Slightly faster pace for energetic confidence shots. End with held static shot for CTA.",
        antiErrorRules: [
            "No extra fingers or deformed hands",
            "Maintain consistent face identity — no morphing",
            "Product must not change shape, color, or text",
            "No sudden background changes or glitches",
            "No merging of character with background",
            "Clothing should not change mid-shot",
            "No unnatural speed changes unless intentional",
        ],
    };
}

export function generateNegativePromptMock(inputs = {}) {
    return {
        negativePrompt:
            "blurry, out of focus, lowres, bad quality, watermark, signature, text overlay, extra fingers, deformed hands, missing fingers, bad anatomy, disfigured face, morphed face, ugly, mutation, poorly drawn, distorted features, extra limbs, fused fingers, cross-eyed, asymmetric eyes, bad proportions, cloned face, duplicate, multiple people unintended, extra arms, twisted body, broken pose, warped clothes, inconsistent lighting, overexposed, underexposed, noise, grain, artifacts, jpeg compression, pixelated, worst quality, normal quality, low quality, amateur photography",
        identityLock: [
            "Không thay đổi khuôn mặt, đặc điểm nhận dạng trong toàn bộ video",
            "Màu tóc và kiểu tóc nhất quán hoàn toàn",
            "Trang phục giữ nguyên — không thêm bớt chi tiết",
            "Màu da tự nhiên và ấm áp trong tất cả cảnh",
        ],
        productLock: [
            "Sản phẩm giữ nguyên hình dạng, màu sắc, nhãn hiệu",
            "Logo và text trên sản phẩm phải rõ ràng và đúng",
            "Kích thước sản phẩm tương đối so với tay nhất quán",
            "Màu bao bì không thay đổi theo ánh sáng",
        ],
        backgroundLock: [
            "Background style nhất quán trong cùng một cảnh",
            "Không thêm vật thể lạ vào background",
            "Tone màu background phải hài hòa với nhân vật",
        ],
        motionStabilityRules: [
            "Camera movement phải smooth, không jerky",
            "Transitions phải mượt mà, không flash trắng đột ngột",
            "Không để nhân vật teleport giữa frames",
            "Background phải ổn định — không breathing effect nếu không dùng handheld mode",
        ],
        qualityRules: [
            "Độ phân giải tối thiểu 1080p",
            "Không có banding màu",
            "Skin texture tự nhiên, không quá smooth như mặt nhựa",
            "Ánh sáng nhất quán trong toàn cảnh",
        ],
    };
}

export default {
    analyzeImage,
    generatePrompts,
    generateScript,
    generateStoryboard,
    generateVideoPrompt,
    generateNegativePrompt,
};
