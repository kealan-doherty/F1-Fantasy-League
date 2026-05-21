export const up = (pgm) => {
    pgm.createTable('user_sessions', {
        sid: { type: 'varchar', primaryKey: true },
        sess: { type: 'json', notNull: true },
        expire: { type: 'timestamp', notNull: true }
    });

    pgm.createIndex('user_sessions', 'expire');
};

export const down = (pgm) => {
    pgm.dropTable('user_sessions')
};