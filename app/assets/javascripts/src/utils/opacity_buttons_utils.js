var OpacityButtonsUtils  = {
    
    hide: function ($button) {
        $button.css('opacity', '0');
        setTimeout(function () { $button.css('display', 'none'); }, 200); // see map.scss: %ebutton
        $button.addClass('mapplic-disabled'); 
    },
    
    show: function ($button) {
        $button.css('display', 'block');
        $button.css('opacity', '1');
        $button.removeClass('mapplic-disabled');
    }
    
};
