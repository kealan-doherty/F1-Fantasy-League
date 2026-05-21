export const up = (pgm) => {
    pgm.createTable('user_info', {
        id: { type: 'serial', primaryKey: true },
        username: { type: 'text', notNull: true, unique: true },
        password: { type: 'text', notNull: true },
        email: { type: 'text', notNull: true, unique: true },
        points: { type: 'integer', notNull: true, default: 0 },
        first_driver: { type: 'text' },
        second_driver: { type: 'text' },
        constructor: { type: 'text' },
        reset_token: { type: 'text' },
        token_expiry: { type: 'timestamp' }
    });
};

export const down = (pgm) => {
    pgm.dropTable('user_info');
};