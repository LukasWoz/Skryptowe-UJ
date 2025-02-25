local TGame = {
    w = 10,
    h = 20,
    c = 30,
    cols = {
        {0.73,0.35,0.23,1},
        {0.12,0.11,0.67,1},
        {0.43,0.45,0.1,1},
        {0.11,0.87,0.45,1}
    },
    shapes = {
        [1] = {
            {{1,1},{1,1}},
            clr=3,
            dim=2
        },
        [2] = {
            {
                {0,1,0},
                {1,1,1}
            },
            {
                {1,0},
                {1,1},
                {1,0}
            },
            {
                {1,1,1},
                {0,1,0}
            },
            {
                {0,1},
                {1,1},
                {0,1}
            },
            clr=1,
            dim=3
        },
        [3] = {
            {
                {1,1,1,1}
            },
            {
                {1},
                {1},
                {1},
                {1}
            },
            clr=4,
            dim=4
        },
        [4] = {
            {
                {1,0},
                {1,0},
                {1,1}
            },
            {
                {1,1,1},
                {1,0,0}
            },
            {
                {1,1},
                {0,1},
                {0,1}
            },
            {
                {0,0,1},
                {1,1,1}
            },
            clr=2,
            dim=3
        }
    },
    audios = {},
    flashes = {}
}

function TGame:new()
    local o={}
    setmetatable(o,self)
    self.__index=self
    o:reset()
    return o
end

function TGame:reset()
    self.board={}
    self.points=0
    self.done=false
    for j=0,self.h-1 do
        self.board[j]={}
        for i=0,self.w-1 do
            self.board[j][i]=0
        end
    end
    self:loadAudio()
    self.timer=0
    self.delay=0.5
    self:spawn()
end

function TGame:loadAudio()
    self.audios.mv=love.audio.newSource("assets/move.wav","static")
    self.audios.rt=love.audio.newSource("assets/rotate.wav","static")
    self.audios.cl=love.audio.newSource("assets/clear.wav","static")
    self.audios.gm=love.audio.newSource("assets/gameover.wav","static")
end

function TGame:spawn()
    self.idx=love.math.random(4)
    self.block=self.shapes[self.idx]
    self.bx=math.floor(self.w/2 - self.block.dim/2)
    self.by=0
    self.rot=1
end

function TGame:update(dt)
    for k=#self.flashes,1,-1 do
        self.flashes[k].a=self.flashes[k].a-dt*2
        if self.flashes[k].a<=0 then
            table.remove(self.flashes,k)
        end
    end
    if not self.done then
        self.timer=self.timer+dt
        if self.timer>=self.delay then
            self.timer=0
            self:drop()
        end
    end
end

function TGame:draw()
    for j=0,self.h-1 do
        for i=0,self.w-1 do
            local v=self.board[j][i]
            if v>0 then
                local cc=self.cols[v]
                love.graphics.setColor(cc)
                love.graphics.rectangle("fill",i*self.c,j*self.c,self.c-1,self.c-1)
            end
        end
    end
    love.graphics.setColor(1,1,1)
    local shp=self.block[self.rot]
    for rr=1,#shp do
        for cc=1,#shp[rr] do
            if shp[rr][cc]==1 then
                local ry=rr-1
                local rx=cc-1
                local px=(self.bx+rx)*self.c
                local py=(self.by+ry)*self.c
                love.graphics.rectangle("fill",px,py,self.c-1,self.c-1)
            end
        end
    end
    for _,f in ipairs(self.flashes) do
        love.graphics.setColor(1,1,1,f.a)
        love.graphics.rectangle("fill",f.x,f.y,self.c-1,self.c-1)
    end
end

function TGame:move(d)
    local nx=self.bx+d
    if not self:collision(nx,self.by,self.rot) then
        self.bx=nx
        if self.audios.mv then
            self.audios.mv:play()
        end
    end
end

function TGame:rotR()
    local nr=(self.rot%#self.block)+1
    if not self:collision(self.bx,self.by,nr) then
        self.rot=nr
        if self.audios.rt then
            self.audios.rt:play()
        end
    end
end

function TGame:drop()
    local ny=self.by+1
    if not self:collision(self.bx,ny,self.rot) then
        self.by=ny
    else
        self:fix()
    end
end

function TGame:collision(px,py,ro)
    local sp=self.block[ro]
    for rr=1,#sp do
        for cc=1,#sp[rr] do
            if sp[rr][cc]==1 then
                local ry=rr-1
                local rx=cc-1
                local tx=px+rx
                local ty=py+ry
                if tx<0 or tx>=self.w then
                    return true
                end
                if ty>=self.h then
                    return true
                end
                if ty>=0 and self.board[ty][tx]~=0 then
                    return true
                end
            end
        end
    end
    return false
end

function TGame:fix()
    local sp=self.block[self.rot]
    local co=self.block.clr
    for rr=1,#sp do
        for cc=1,#sp[rr] do
            if sp[rr][cc]==1 then
                local ry=rr-1
                local rx=cc-1
                local fy=self.by+ry
                local fx=self.bx+rx
                if fy>=0 then
                    self.board[fy][fx]=co
                end
            end
        end
    end
    self:lines()
    self:spawn()
    if self:collision(self.bx,self.by,self.rot) then
        self.done=true
        if self.audios.gm then
            self.audios.gm:play()
        end
    end
end

function TGame:lines()
    local ds={}
    for j=0,self.h-1 do
        local full=true
        for i=0,self.w-1 do
            if self.board[j][i]==0 then
                full=false
                break
            end
        end
        if full then
            table.insert(ds,j)
        end
    end
    if #ds>0 then
        self:addFlash(ds)
        if self.audios.cl then
            self.audios.cl:play()
        end
        self.points=self.points+(#ds*100)
        for _,lineY in ipairs(ds) do
            table.remove(self.board,lineY)
            local nr={}
            for i=0,self.w-1 do
                nr[i]=0
            end
            table.insert(self.board,1,nr)
        end
    end
end

function TGame:addFlash(rows)
    for _,ly in ipairs(rows) do
        for cx=0,self.w-1 do
            table.insert(self.flashes,{x=cx*self.c,y=ly*self.c,a=1})
        end
    end
end

function TGame:save()
    local arr={}
    table.insert(arr,"points="..tostring(self.points))
    table.insert(arr,"idx="..tostring(self.idx))
    table.insert(arr,"rot="..tostring(self.rot))
    table.insert(arr,"bx="..tostring(self.bx))
    table.insert(arr,"by="..tostring(self.by))
    for j=0,self.h-1 do
        local row={}
        for i=0,self.w-1 do
            table.insert(row,tostring(self.board[j][i]))
        end
        table.insert(arr,table.concat(row,","))
    end
    love.filesystem.write("save.txt",table.concat(arr,"\n"))
end

function TGame:load()
    if not love.filesystem.getInfo("save.txt") then return end
    local dat=love.filesystem.read("save.txt")
    local lines={}
    for ln in dat:gmatch("[^\r\n]+") do
        table.insert(lines,ln)
    end
    if #lines<(5+self.h) then return end
    for c=1,5 do
        local k,v=lines[c]:match("([^=]+)=([^=]+)")
        if k and v then
            if k=="points" then
                self.points=tonumber(v)
            elseif k=="idx" then
                self.idx=tonumber(v)
                self.block=self.shapes[self.idx]
            elseif k=="rot" then
                self.rot=tonumber(v)
            elseif k=="bx" then
                self.bx=tonumber(v)
            elseif k=="by" then
                self.by=tonumber(v)
            end
        end
    end
    local start=6
    for j=0,self.h-1 do
        local ln=lines[start+j]
        local row={}
        for val in ln:gmatch("([^,]+)") do
            table.insert(row,tonumber(val))
        end
        for i=0,self.w-1 do
            self.board[j][i]=row[i+1] or 0
        end
    end
end

local game = TGame:new()

function love.load()
    love.window.setMode(TGame.w*TGame.c,TGame.h*TGame.c)
    love.window.setTitle("Tetris")
end

function love.update(dt)
    game:update(dt)
end

function love.draw()
    game:draw()
    love.graphics.setColor(1,1,1)
    love.graphics.print("Pkt: "..game.points,10,10)
    if game.done then
        love.graphics.printf("KONIEC",0,(TGame.h*TGame.c)/2,TGame.w*TGame.c,"center")
        love.graphics.printf("R = restart",0,(TGame.h*TGame.c)/2+30,TGame.w*TGame.c,"center")
    end
end

function love.keypressed(k)
    if game.done then
        if k=="r" then
            game:reset()
        end
        return
    end
    if k=="left" then
        game:move(-1)
    elseif k=="right" then
        game:move(1)
    elseif k=="down" then
        game:drop()
    elseif k=="up" then
        game:rotR()
    elseif k=="s" then
        game:save()
    elseif k=="l" then
        game:load()
    elseif k=="escape" then
        love.event.quit()
    end
end
