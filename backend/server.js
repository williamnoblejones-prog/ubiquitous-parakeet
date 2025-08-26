import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const app = express();
const upload = multer();
const PORT = 3000;

// ===== FILEBASE CONFIG =====
const s3 = new S3Client({
    endpoint: "https://s3.filebase.com",
    region: "us-east-1",
    credentials: {
        accessKeyId: "B91FBAB698C2FC260128",
        secretAccessKey: "sOlZwYHCqBBRRAfWQ0hdetvqvIgkJ46bQk0GjTuf"
    }
});
const BUCKET_NAME = "unique-blush-newt";

// ===== ENCRYPTION =====
const PASSWORD = "mySuperSecretPassword"; // Ideally store securely

async function getKey() {
    return crypto.createHash('sha256').update(PASSWORD).digest();
}

async function encryptBuffer(buffer) {
    const key = await getKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]); // store iv + tag + ciphertext
}

async function decryptBuffer(buffer) {
    const key = await getKey();
    const iv = buffer.slice(0, 12);
    const tag = buffer.slice(12, 28);
    const data = buffer.slice(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted;
}

// ===== UPLOAD ENDPOINT =====
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const encrypted = await encryptBuffer(req.file.buffer);
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: req.file.originalname,
            Body: encrypted
        }));
        res.json({ success: true, file: req.file.originalname });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ===== LIST FILES =====
app.get('/files', async (req, res) => {
    try {
        const list = await s3.send(new ListObjectsCommand({ Bucket: BUCKET_NAME }));
        res.json(list.Contents || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ===== DOWNLOAD & DECRYPT =====
app.get('/download/:key', async (req, res) => {
    try {
        const key = req.params.key;
        const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
        const stream = obj.Body;
        const chunks = [];
        for await (let chunk of stream) chunks.push(chunk);
        const encryptedBuffer = Buffer.concat(chunks);
        const decrypted = await decryptBuffer(encryptedBuffer);
        res.set('Content-Type', 'image/*');
        res.send(decrypted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ===== STATIC FRONTEND =====
app.use(express.static('../frontend'));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

//Github token: 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