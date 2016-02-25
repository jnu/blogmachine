import dreija from '../dreija';

import Routes from './Routes';

dreija
    .routes(Routes)
    .dbname('joenoodles')
    .dbhost(`http://${DBHOSTNAME}:5984`)



export default dreija;
