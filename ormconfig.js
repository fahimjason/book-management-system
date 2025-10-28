/* eslint-disable */

const { DataSource } = require('typeorm');

var dbConfig = {
    synchronize: process.env.NODE_ENV !== 'production',
    migrations: ['migrations/*.js'],
    cli: {
        migrationsDir: 'migrations'
    }
};

switch (process.env.NODE_ENV) {
    case 'development':
        Object.assign(dbConfig, {
            type: 'sqlite',
            database: 'db.sqlite',
            entities: ['dist/**/*.entity.js'],
        });
        break;
    case 'test':
        Object.assign(dbConfig, {
            type: 'sqlite',
            database: 'test.sqlite',
            entities: ['**/*.entity.ts'],
            migrationsRun: true
        });
        break;
    case 'production':
        Object.assign(dbConfig, {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            migrationsRun: true,
            entities: ['**/*.entity.js'],
            ssl: {
                rejectUnauthorized: false,
            }
        });
        break;

    default:
        throw new Error('Unknown environment');
}

const dataSource = new DataSource(dbConfig);

module.exports = {
    ...dbConfig,
    dataSource
};
