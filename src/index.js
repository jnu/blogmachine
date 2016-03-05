import Routes from './Routes';

export default (dreija, env) => {
    dreija
        .routes(Routes)
        .dbname('joenoodles')
        .dbhost(`http://${env.DBHOSTNAME}:5984`);
};
