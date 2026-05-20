import rateLimit from 'express-rate-limit';

// handles most or all routes to prvent abuse
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    limit: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// handles sensitive routes like sign in and password reset to prevent brute force. 
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    limit: 5, // limit each IP to 5 requests per windowMs
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
});