$(document).ready(function(){ 
    
    $('#getTickets').on('click', function() {

        if(!$("#ticketDate").val()) { alert('Please, choose the date'); }

        var date = new Date($("#ticketDate").val());
        var previousDate = new Date($("#ticketDate").val());

        switch(previousDate.getDay()) {
            case 1: 
                previousDate.setDate(previousDate.getDate()-3);
                break;
            case 0: 
                previousDate.setDate(previousDate.getDate()-2);
                break;
            default: 
                previousDate.setDate(previousDate.getDate()-1);
            break;

        }
        
        console.log(`Date: Month: ${date.getUTCMonth()+1}, Day: ${date.getUTCDate()}, Year: ${date.getUTCFullYear()}`);
        console.log(`Previous: Month: ${previousDate.getUTCMonth()+1}, Day: ${previousDate.getUTCDate()}, Year: ${previousDate.getUTCFullYear()}`);
        
        $("#tickets").val('');
        $.ajax( { url: `https://www.briefing.com/investor/calendars/earnings/${date.getUTCFullYear()}/${date.getUTCMonth()+1}/${date.getUTCDate()}/`,
        type: "GET",
        xhrFields: {
            withCredentials: true
         },
        success: function(data) {
            var beforeTheOpen = /Before The Open(?:.|\n)+After The Close/gmi.exec(data);
            if(beforeTheOpen) {
                console.log('BEFORE THE OPEN:')
                var beforeTheOpenTickets = /<a class="ticker".+>(.+)<\/a>/gmi;

                var ticketArray = [];
                while((ticket = beforeTheOpenTickets.exec(beforeTheOpen[0])) !== null) {
                    ticketArray.push(ticket[1]); 
                }
                console.log(ticketArray.join(', '));
                if($("#tickets").val().length > 1) {
                    $("#tickets").val($("#tickets").val() + ', ' + ticketArray.join(', '));
                } else {
                    $("#tickets").val(ticketArray.join(', '));
                }
            }
        }})

        $.ajax( { url: `https://www.briefing.com/investor/calendars/earnings/${previousDate.getUTCFullYear()}/${previousDate.getUTCMonth()+1}/${previousDate.getUTCDate()}/`,
        type: "GET",
        xhrFields: {
            withCredentials: true
         },
        success: function(data) {
            var afterTheClose = /After The Close(?:.|\n)+/gmi.exec(data);
            if(afterTheClose) {
                console.log('AFTER THE CLOSE:')
                var ticketArray = [];
                var afterTheCloseTickets = /<a class="ticker".+>(.+)<\/a>/gmi;
                while((ticket = afterTheCloseTickets.exec(afterTheClose[0])) !== null) {
                    ticketArray.push(ticket[1]); 
                }
                console.log(ticketArray.join(', '));
                if($("#tickets").val().length > 1) {
                    $("#tickets").val($("#tickets").val() + ', ' + ticketArray.join(', '));
                } else {
                    $("#tickets").val(ticketArray.join(', '));
                }
            }
            
        }})

    });
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

                    if($("#tickets_red").val().length > 1) {
                        $("#tickets_red").val($("#tickets_red").val() + ' ' + ticket.trim());
                    } else {
                        $("#tickets_red").val(ticket.trim());
                    }
                   
                } else {
                   
                    if($("#tickets_green").val().length > 1) {
                        $("#tickets_green").val($("#tickets_green").val() + ' ' + ticket.trim());
                    } else {
                        $("#tickets_green").val(ticket.trim());
                    }
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



