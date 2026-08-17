import multer from "multer";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;

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