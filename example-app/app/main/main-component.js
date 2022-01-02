import PartyMember from '../../lib/party-member';

const MainComponent = new PartyMember(
    'main-component',
    {
        title: 'Title',
        titleClass: 'red',
        titleId: 'bg-yellow',
        showTitle: true,
    },
    {
        switchClass: function() {
            const titleClass = this.watchers.titleClass;
            this.watchers.titleClass = (titleClass === 'red' ? 'blue' : 'red');
        },
        switchId: function() {
            const titleId = this.watchers.titleId;
            this.watchers.titleId = (titleId === 'bg-cyan' ? 'bg-yellow' : 'bg-cyan');
        },
        toggleTitle: function(event) {
            const showTitle = event.target.checked;
            this.watchers.showTitle = showTitle;
        }
    },
    'app/main/main-component.html');

export default MainComponent;
