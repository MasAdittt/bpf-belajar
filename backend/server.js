import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();

// Enhanced CORS configuration
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// Helper function to validate URL
const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

// Helper function to extract place ID with error handling
const extractPlaceId = async (page) => {
    try {
        return await page.evaluate(() => {
            const patterns = [
                /!1s([0-9x]+:[0-9x]+)!/,
                /place\/.*\/@.*\/data=.*!1s([0-9x]+:[0-9x]+)/,
                /maps.*!1s([0-9x]+:[0-9x]+)/
            ];
            
            const url = window.location.href;
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) return match[1];
            }
            return null;
        });
    } catch (error) {
        console.error('Error extracting place ID:', error);
        return null;
    }
};

// Main URL expansion endpoint
app.post('/expand/url', async (req, res) => {
    const { url } = req.body;
    let browser = null;
    let page = null;
    
    // Input validation
    if (!url) {
        return res.status(400).json({ 
            error: 'URL tidak boleh kosong',
            status: 'error'
        });
    }

    if (!isValidUrl(url)) {
        return res.status(400).json({
            error: 'URL tidak valid',
            status: 'error'
        });
    }

    try {
        // Launch browser with enhanced error handling
        browser = await puppeteer.launch({ 
            headless: "new",
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process'
            ],
            ignoreHTTPSErrors: true
        });
        
        page = await browser.newPage();
        await page.setDefaultNavigationTimeout(45000);
        
        // Enhanced navigation error handling
        const response = await page.goto(url, { 
            waitUntil: 'networkidle0',
            timeout: 45000
        }).catch(async (error) => {
            console.error('Navigation error:', error);
            const finalUrl = page.url();
            if (finalUrl && finalUrl !== url) {
                return { ok: true, url: finalUrl };
            }
            throw new Error(`Navigation failed: ${error.message}`);
        });

        // Additional delay for redirect completion
        await page.waitForTimeout(3000);
        
        const finalUrl = page.url();
        console.log('Expanded URL:', finalUrl);
        
        const placeId = await extractPlaceId(page);
        console.log('Found Place ID:', placeId);

        if (!finalUrl || finalUrl === 'about:blank') {
            throw new Error('Failed to expand URL - received invalid response');
        }

        res.json({ 
            status: 'success',
            longUrl: finalUrl,
            placeId: placeId 
        });
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Gagal memproses URL',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            status: 'error'
        });
    } finally {
        try {
            if (page) await page.close();
            if (browser) await browser.close();
        } catch (error) {
            console.error('Error closing browser:', error);
        }
    }
});

// Enhanced global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        error: 'Terjadi kesalahan pada server',
        status: 'error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});