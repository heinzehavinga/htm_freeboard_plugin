//Based on the Freeboard data plugin tutorial found at http://freeboard.github.io/freeboard/docs/plugin_example.html
(function()
{
    
    freeboard.loadDatasourcePlugin({
        "type_name"   : "htm_fake_timestamp_data",
        "display_name": "HTBM fake timestamp data",
        "description" : "Some sort of description <strong>with optional html!</strong>",
//        "external_scripts" : [
//			"http://mydomain.com/myscript1.js",
//		    "http://mydomain.com/myscript2.js"
//		],
        "settings"    : [
            
			{
				"name"        : "array",
				"display_name": "Your age",
                "type"        : "option",
                "options"     : [
					{
                        "name" : "single",
                        "value": "single"
					},
                    {
						"name" : "last hour (per minute)",
						"value": "hour"
					},
                    {
						"name" : "last day (per hour)",
						"value": "day"
					}
				]
			},
			{
				"name"         : "refresh_time",
				"display_name" : "Refresh Time",
				"type"         : "text",
				"description"  : "In milliseconds",
				"default_value": 5000
			}
		],
        newInstance   : function(settings, newInstanceCallback, updateCallback)
		{
           newInstanceCallback(new myDatasourcePlugin(settings, updateCallback));
		}
	});
    
    var myDatasourcePlugin = function(settings, updateCallback)
	{
        var self = this;
        var currentSettings = settings;

		/* This is some function where I'll get my data from somewhere */
		function getData()
		{
			
            var d = new Date();
            var n = d.toISOString();
            var v = Math.floor(Math.random() * 11);
            var newData = {"datetime":n,"type":"indicator1","lat":52.22085200000000071440808824263513088226318359375,"long":6.890950000000000130739863379858434200286865234375,"value":v} // Just putting some sample data in for fun.

			/* Get my data from somewhere and populate newData with it... Probably a JSON API or something. */
			/* ... */
            updateCallback(newData);
		}
        var refreshTimer;

		function createRefreshTimer(interval)
		{
			if(refreshTimer)
			{
				clearInterval(refreshTimer);
			}

			refreshTimer = setInterval(function()
			{
                getData();
			}, interval);
		}
        self.onSettingsChanged = function(newSettings)
		{
            currentSettings = newSettings;
		}
        self.updateNow = function()
		{
            getData();
		}
        self.onDispose = function()
		{
            clearInterval(refreshTimer);
			refreshTimer = undefined;
		}
        createRefreshTimer(currentSettings.refresh_time);
	}
    
    freeboard.loadWidgetPlugin({
        "type_name"   : "htm_Indicator",
		"display_name": "Indicator showing a value and trend arrow",
        "description" : "Some sort of description <strong>with optional html!</strong>",
        
//        "external_scripts": [
//			"http://mydomain.com/myscript1.js", "http://mydomain.com/myscript2.js"
//		],
        "fill_size" : false,
		"settings"    : [
			{
				"name"        : "the_text",
				"display_name": "Data",
                "type"        : "calculated"
			},
            {
				"name"        : "upper_limit",
				"display_name": "Upper Limit",
                "description"  : "When should indicator turn green",
                "type"        : "calculated"
			},
            {
				"name"        : "low_limit",
				"display_name": "Lower limit",
                "description"  : "When should indicator turn red",
                "type"        : "calculated"
			},
			{
				"name"        : "size",
				"display_name": "Size",
				"type"        : "option",
				"options"     : [
					{
						"name" : "Regular",
						"value": "regular"
					},
					{
						"name" : "Big",
						"value": "big"
					},
                    
				]
			}
		],
        newInstance   : function(settings, newInstanceCallback)
		{
			newInstanceCallback(new myWidgetPlugin(settings));
		}
	});
    
    var myWidgetPlugin = function(settings)
	{
        var self = this;
		var currentSettings = settings;
        var upArrow = $("<div>⬆</div>");
        var myTextElement = $("<div></div>");
        var downArrow = $("<div>⬇</div>");
        self.render = function(containerElement)
		{
            $(containerElement).append(upArrow);
            $(containerElement).append(myTextElement);
            $(containerElement).append(downArrow);
            var divSize = 20*self.getHeight();
            var fontSize = self.getHeight();
            $(myTextElement).css({
                "width":"100%",
                "height":divSize+"px",
                "border-radius":"8px",
                "text-align": "center",
                "vertical-align": "middle",
                "line-height": divSize+"px",
                "font-size": fontSize+".0em"
            });
            $(upArrow).css({"visibility":"hidden","text-align":"center"});
            $(downArrow).css({"visibility":"hidden","text-align":"center"});
        }
        self.getHeight = function()
		{
			if(currentSettings.size == "big")
			{
				return 2;
			}
			else
			{
				return 1;
			}
		}
        self.onSettingsChanged = function(newSettings)
		{
            currentSettings = newSettings;
		}
        self.onCalculatedValueChanged = function(settingName, newValue)
		{
            if(settingName == "the_text")
			{
                //FIXME: base this on start settings!
                var color = "red";
                if(parseInt(newValue)>currentSettings.upper_limit){
                    var color = "green";
                } else if(parseInt(newValue)>currentSettings.low_limit){
                    var color = "yellow";
                }
                var currentValue = parseInt($(myTextElement).html());
                
                if(currentValue!== NaN){
                    if(currentValue>newValue){
                        $(upArrow).css({"visibility":"hidden"});
                        $(downArrow).css({"visibility":"visible"});
                    } else if(currentValue<newValue) {
                        $(upArrow).css({"visibility":"visible"});
                        $(downArrow).css({"visibility":"hidden"});
                    }
                    else if(currentValue==newValue){
                        $(upArrow).css({"visibility":"hidden"});
                        $(downArrow).css({"visibility":"hidden"});
                    }
                }
                $({ val: currentValue }).animate({ val: newValue }, {
                    duration: 500,
                    easing: 'linear',
                    step: function(val) {
                        $(myTextElement).html(Math.ceil(val));
                    }
                });
                
                $(myTextElement).css({"background-color": color, "color":"white"});
			}
		}
        self.onDispose = function()
		{
		}
	}
}());