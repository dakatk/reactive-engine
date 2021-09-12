import '../css/style.css';
import '../static/favicon.jpg';

import MainComponent from './components/main.component';
import SelectComponent from './components/select.component';
import DateComponent from './components/date.component';
import BigBrother from './lib/ingsoc';

BigBrother.registerPartyMember(MainComponent);
BigBrother.registerPartyMember(SelectComponent);
BigBrother.registerPartyMember(DateComponent);
BigBrother.isWatching();