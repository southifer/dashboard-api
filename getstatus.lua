function botStatus(bot)
    local status = getBot(bot).status
    local statusNaming = {
        [BotStatus.offline] = "Offline",
        [BotStatus.online] = "Online",
        [BotStatus.account_banned] = "Account Banned",
        [BotStatus.location_banned] = "Location Banned",
        [BotStatus.server_overload] = "Server Overload",
        [BotStatus.too_many_login] = "Too Many Login",
        [BotStatus.maintenance] = "Maintenance",
        [BotStatus.version_update] = "Version Update",
        [BotStatus.server_busy] = "Server Busy",
        [BotStatus.error_connecting] = "Error Connecting",
        [BotStatus.logon_fail] = "Login Failed",
        [BotStatus.http_block] = "HTTP Blocked",
        [BotStatus.wrong_password] = "Wrong Password",
        [BotStatus.advanced_account_protection] = "Advanced Account Protection",
        [BotStatus.bad_name_length] = "Bad Name Length",
        [BotStatus.invalid_account] = "Invalid Account",
        [BotStatus.guest_limit] = "Guest Limit",
        [BotStatus.changing_subserver] = "Changing Subserver",
        [BotStatus.captcha_requested] = "Captcha",
        [BotStatus.mod_entered] = "Mod Entered",
        [BotStatus.high_load] = "High Load",
        [BotStatus.bad_gateway] = "Bad Gateway" ,
        [BotStatus.server_issue] = "Server Issue" ,
        [BotStatus.retrieving_token] = "Retrieving Token" ,
        [BotStatus.player_entered] = "Player Entered",
        [BotStatus.getting_server_data] = "Getting Server Data",
        [BotStatus.bypassing_server_data] = "Bypassing Server Data",
        [BotStatus.couldnt_warp] = "Couldn't Warp",
    }
    return statusNaming[status] or "Loading"
end

function rotationStatus(bot)
    local status = getBot(bot).rotation.status
    local statusNaming = {
        [RotationStatus.scanning_world] = "Scanning World",
        [RotationStatus.harvesting_trees] = "Harvesting Tree",
        [RotationStatus.farming_block] = "Farming Block",
        [RotationStatus.planting_seeds] = "Planting Seeds",
        [RotationStatus.dropping_seeds] = "Dropping Seeds",
        [RotationStatus.dropping_packs] = "Dropping Packs",
        [RotationStatus.filling_seeds] = "Filling Seeds",
        [RotationStatus.harvesting_roots] = "Harvesting Roots",
        [RotationStatus.collecting_fossils] = "Collecting Fossils",
        [RotationStatus.clearing_fires] = "Clearing Fires",
        [RotationStatus.clearing_toxic_wastes] = "Clearing Toxic Waste",
        [RotationStatus.clearing_objects] = "Clearing Objects",
        [RotationStatus.reaching_level] = "Reaching Level",
        [RotationStatus.clearing_history] = "Clearing History",
        [RotationStatus.creating_home_world] = "Creating Home World",
    }
    return statusNaming[status] or "Loading"
end

while true do
    for index,user in pairs(getBots()) do

        client = HttpClient.new()

        -- Set the target URL
        client.url = "http://93.113.180.31:5000/api/users"

        -- Set the HTTP method to POST
        client:setMethod(Method.post)

        bot = getBot(user.name)
        data = [[
        {
            "index" : ]] .. index .. [[,
            "username" : "]] .. bot.name .. [[",
            "level" : ]] .. bot.level .. [[,
            "ping" : ]] .. bot:getPing() .. [[,
            "status" : "]] .. botStatus(bot.name) .. [[",
            "rotation_status" : "]] .. rotationStatus(bot.name) .. [[",
            "proxy" : "]] .. bot:getProxy().ip .. [[:]] .. bot:getProxy().port .. [[",
            "world" : "]] .. bot:getWorld().name .. [[",
            "position" : "]] .. bot.x .. [[:]] .. bot.y .. [[",
            "gems" : ]] .. bot.gem_count .. [[,
            "obtained_gems" : 0,
            "playtime" : ]] .. bot:getPlaytime() ..[[,
            "online_time" : "]] .. bot:getActiveTime() ..[[",
            "age" : ]] .. bot:getAge() ..[[
        }
        ]]
        client.content = data

        -- Set the Content-Type header to application/json
        client.headers["Content-Type"] = "application/json"

        -- Send the request
        response = client:request()

        -- Print the response status and body
        print("Response Status: " .. response.status)
        sleep(1)
    end
end