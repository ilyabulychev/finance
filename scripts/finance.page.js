$(document).ready(function(){ 

    $('#scan').on('click', function() {
        $(".ticket-trs").remove();
        $(".ticket-trs-red").remove();
        var tickets = $("#tickets").val().replace(/\n/g, ",").replace(" ", ",").split(',');

        console.log(`Price: ${$("#select_price").val()} : ${$("#input_price").val()}`);
        console.log(`AVG: ${$("#select_avg").val()} : ${$("#input_avg").val()}`);
        console.log(`ATR: ${$("#select_atr").val()} : ${$("#input_atr").val()}`);

        tickets.forEach(ticket => {
   
            $.ajax( { url: "https://finviz.com/quote.ashx?t=" + ticket.trim(),
            type: "GET",
            success: function(data) {
              var price = />Price<.+<b>(.+)<\/b>/i.exec(data)[1];
              var avgVolume = />Avg Volume<.+<b>(.+)<\/b>/i.exec(data)[1];
              var atr = />ATR<.+<b>(.+)<\/b>/i.exec(data)[1];

              console.log(`Price: ${price}, avgVolume: ${avgVolume}, ATR: ${atr}`);

              let clone = $("#template").clone().appendTo("#table_passed");
              $(clone).show();
       
              $(clone).attr('class', 'ticket-trs');
              

              if(!CheckFinance($("#select_avg").val(), avgVolume, $("#input_avg").val()) ||
                 !CheckFinance($("#select_atr").val(), atr, $("#input_atr").val()) ||
                 !CheckFinance($("#select_price").val(), price, $("#input_price").val())) {
                    $(clone).attr('class', 'ticket-trs-red');
                 }
             
              $(clone).find('.td_avg').css('color', CheckFinance($("#select_avg").val(), avgVolume, $("#input_avg").val()) ? 'green': 'red');
              $(clone).find('.td_avg').html(avgVolume);

              $(clone).find('.td_atr').css('color', CheckFinance($("#select_atr").val(), atr, $("#input_atr").val()) ? 'green': 'red');
              $(clone).find('.td_atr').html(atr);

              $(clone).find('.td_price').css('color', CheckFinance($("#select_price").val(), price, $("#input_price").val()) ? 'green': 'red')
              $(clone).find('.td_price').html(price);
              $(clone).find('a').attr('href', 'https://finviz.com/quote.ashx?t=' + ticket.trim());
              $(clone).find('a').html(ticket.trim());
                } 
            });
        });
        
    });
});

$('#hide_red').on('click', function() { 
    $(".ticket-trs-red").hide();
});

$('#show_red').on('click', function() { 
    $(".ticket-trs-red").show();
})

function CheckFinance(symbol, a, b) {
    a = ParceNumber(a);
    b = ParceNumber(b);
    switch(symbol) {
        case '>': return a > b;
        case '>=': return a >= b;
        case '=': return a == b;
        case '<': return a < b;
        case '<=': return a <= b;
        default: return false;
    }
}

function ParceNumber(str) {
    var symbol = str.substr(-1);
    if(symbol == 'K' || symbol == 'К'|| symbol == 'M'|| symbol == 'М'|| symbol == 'B'|| symbol == 'В') {
        var number  = Number(str.substring(0, str.length-1));

        switch(symbol) {
            case 'K':
            case 'К':
                return number * 1000;

            case 'M':
            case 'М':
            return number * 1000000;

            case 'B':
            case 'В': 
            return number * 1000000000;
        }
    } else {
        return Number(str);
    }
    
}



