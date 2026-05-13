import crypto from 'crypto';
/*
creating the hased token for password reset this will be finsihed once the rest of the app if back to running properly.
*/
export async function genPasswordToken(email){
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
}

