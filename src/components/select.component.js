import PartyMember from '../lib/party-member';

const SelectComponent = new PartyMember(
    'select-component',
    {
        text: ['Zero', 'One', 'Two']
    },
    {
        updateText: function (event) {
            this.watchers.text[0] = event.target.value;
        }
    },
    true);

export default SelectComponent;