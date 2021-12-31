import PartyMember from '../../lib/party-member';
import todaysDate from './todays-date';

const SelectComponent = new PartyMember(
    'select-component',
    {
        text: ['Zero', 'One', 'Two']
    },
    {
        updateText: function(event) {
            const dateComponent = this.children.example;

            dateComponent.watchers.date = todaysDate();
            this.watchers.text[0] = event.target.value;
        }
    },
    'app/select/select.component.html');

export default SelectComponent;