import PartyMember from 'ingsoc-js/lib/party-member.js';

const SelectComponent = new PartyMember(
    'select-component',
    {
        text: ['Zero', 'One', 'Two']
    },
    {
        updateText: function(event) {
            this.watchers.text[0] = event.target.value;
        }
    });

export default SelectComponent;