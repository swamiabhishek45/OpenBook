import multer from "multer";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;

const IMAGE_EXTENSIONS = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".bmp",
    ".tif",
    ".tiff",
    ".heic",
    ".heif",
]);

export const pdfUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_PDF_SIZE_BYTES },
    fileFilter: (_req, file, callback) => {
        const isPdfMime =
            file.mimetype === "application/pdf" ||
            file.mimetype === "application/x-pdf" ||
            file.mimetype === "application/octet-stream";
        const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");

        if (isPdfMime || isPdfExt) {
            callback(null, true);
            return;
        }

        callback(new Error("Only PDF files are allowed"));
    },
});

export const uploadSinglePdf = pdfUpload.single("file");

export const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
    fileFilter: (_req, file, callback) => {
        const isImageMime = file.mimetype.startsWith("image/");
        const lower = file.originalname.toLowerCase();
        const isImageExt = [...IMAGE_EXTENSIONS].some((ext) =>
            lower.endsWith(ext),
        );

        if (isImageMime || isImageExt) {
            callback(null, true);
            return;
        }

        callback(new Error("Only image files are allowed"));
    },
});

export const uploadSingleImage = imageUpload.single("file");