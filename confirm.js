var confirm = {
        
    isDisplayed: false,
    
    display: function() {
        var confirmDialog =     
            '<div id="confirm-background">' + 
                '<div id="confirm">' + 
					'Are you sure you want to reset?' +
					'<div><button id="yes">Yes</button><button id="no">No</button></div>' + 
                '</div>' +
            '</div>';
        if (!this.isDisplayed) {
            this.isDisplayed = true;
            $('body').append(confirmDialog);
        }
    },
    
    destroy: function() {
        if (this.isDisplayed) {
            this.isDisplayed = false;
            $('#confirm-background').remove();
        }
    }
};