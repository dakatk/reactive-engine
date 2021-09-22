import PartyMember from '../lib/party-member';
import BigBrother from '../lib/ingsoc';

const MainComponent = new PartyMember(
    'main-component',
    {
        title: 'Title',
        titleClass: 'red',
        titleId: 'bg-yellow',
        showTitle: true,
    },
    {
        switchClass: function () {
            const titleClass = this.watchers.titleClass;
            const topWatchers = BigBrother.partyMembers['top'].watchers;
            topWatchers.title += '-';
            this.watchers.titleClass = (titleClass === 'red' ? 'blue' : 'red');
        },
        switchId: function () {
            const titleId = this.watchers.titleId;
            this.watchers.titleId = (titleId === 'bg-cyan' ? 'bg-yellow' : 'bg-cyan');
        },
        toggleTitle: function (event) {
            const showTitle = event.target.checked;
            this.watchers.showTitle = showTitle;
        }
    });

export default MainComponent;
