import Routes from './Routes';

export default (dreija, env) => {
    dreija
        .routes(Routes)
        .dbname('joenoodles')
        .dbhost(`${env.DBHOSTNAME}`)
        .redishost(`${env.REDISHOST}`);
};
