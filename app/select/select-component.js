import PartyMember from 'ingsoc-js/party-member';

const SelectComponent = new PartyMember(
    'select-component',
    {
        text: ['Zero', 'One', 'Two']
    },
    {
        updateText: function(event) {
            this.watchers.text[0] = event.target.value;
            console.log(this.parent.watchers.message);
        }
    });

export default SelectComponent;