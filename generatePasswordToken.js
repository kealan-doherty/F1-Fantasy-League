export function genPasswordToken(){
    return crypto.randomBytes(32).toString('hex');
}

