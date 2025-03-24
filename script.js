var bgImg,cars,walk,pedestrian,biker,bikeLane,sounds,train,chicken,button,left,right,restart,info,mins,randNum=[],cluck;
var paused=false;
var colors=['red','yellow','green','lightblue','purple','orange','blue','white','brown'];
function preload(){
    bgImg=loadImage("background.png");
    pedestrian=loadImage("pedestrian.png");
    biker=loadImage("biker.png");
    bikeLane=loadImage("bikeLane.png");
    train=loadImage("train.png");
    sounds=[loadSound("car_beep.mp3"),loadSound("bike_bell.mp3"),loadSound("whistles.mp3"),loadSound("train_horn.mp3")]
    cluck=loadSound("cluck.mp3")
    walk=[loadImage("walk1.png"),loadImage("walk2.png"),loadImage("walk3.png"),loadImage("walk4.png"),loadImage("walk5.png"),loadImage("walk6.png"),loadImage("walk7.png")];
    cars=[loadImage("car1.png"),loadImage("car2.png"),loadImage("car3.png"),loadImage("car4.png"),loadImage("car5.png"),loadImage("car6.png")];
    chicken=loadImage("chicken.png")
}
function displayCarCombos(){
    for(let i=0;i<6;i++){
        tint ('red')
        image (cars[i],(i*50),472.5-35,50,25)
        tint ('yellow')
        image (cars[i],i*50,472.5,50,25)
        tint ('green')
        image (cars[i],(i*50),472.5+(1*35),50,25)
        tint ('lightblue')
        image (cars[i],i*50,472.5+(2*35),50,25)
        tint ('purple')
        image (cars[i],i*50,472.5+(3*35),50,25)
        tint ('orange')
        image (cars[i],i*50,472.5+(4*35),50,25)
        tint ('blue')
        image (cars[i],i*50,472.5+(5*35),50,25)
        tint ('white')
        image (cars[i],i*50,472.5+(6*35),50,25)
        tint ('brown')
        image (cars[i],i*50,472.5+(7*35),50,25)
    }
    //combos that don't work: car5 with green and blue, car3 with red, car2 with blue
    noTint();
}

function findTime(string){
    if(int(string[4])===0){
        return string[0]+string[1]+string[2]+string[3]+string[4]
    }else{
        return string[0]+string[1]+string[2]+string[3]
    }
}

function showVehicles(){
    for(let i=0;i<vehicles.length;i++){
        vehicles[i].update()
        if(!vehicles[i].offscreen){
            vehicles[i].draw()
        }
    }
}

var sound=1;
var visual=1;
var activeTime=0.1;
//activeTime=670
var stackNum=0;
var carCombos=[];
var frame=-1;
var vehicles=[];
var playing=false;
var win=false;
var coolDown=20;
var playSpeed=1;
var player=0;
var phase=0;
var bestScore=0;
var score=0;
var endTime=0;
var startTime=0;
var bestScores=[];
var deathCounts=[];
var deaths=0;


function setup() {
    createCanvas(768, 780);
    angleMode(DEGREES);
    outputVolume(1);
}
function draw(){
    background(120,166,90);
    image (bgImg,0,102,768,560);
    noStroke();
    fill(200);
    rect(0,347+82,768,316);
    rect(0,338,768,27);
    image(pedestrian,25,338,65,25)
    rect(0,370,768,53);
    image(bikeLane,25,372,70,50)
    fill("white");
    rect(0,663+82,768,10);
    fill(120,166,90);
    rect(0,673+82,768,25);
    for(let y=1;y<9;y++){
        for(let x=0;x<8;x++){
            fill(255,255,84);
            rect(20+(x*100),348+(y*35)+82,30,5);
        }
    }
    function generateCarCombos(num){
        var combos=[];
        var comboSelected=[];
        var rand;
        var rand2;
        for(let i=0;i<num;i++){
            comboSelected=[];
            rand=floor(random()*colors.length)
            rand2=floor(random()*6)
            comboSelected=[colors[rand],rand2]
            if(colors[rand]=='blue'&&(rand2==4 || rand2==1)){
                comboSelected=['yellow',1];
            }
            if(colors[rand]=='green'&&(rand2==4)){
                comboSelected=['lightblue',4];
            }
            if(colors[rand]=='red'&&(rand2==2)){
                comboSelected=['white',0];
            }
            combos.push(comboSelected)
        }
        return combos
    }
    if(frame==0){
        carCombos=generateCarCombos(150);
        randNum=[random(),random()];
    }
    
    //console.log(mouseX,mouseY)
    function Player(x,row){
        this.x=x;
        this.row=row;
        this.keyWasPressed=false;
        this.cooldown=0
        this.getYFromRow=function(row){
            var y=0
            if(row==0){
                y=758
            }else if(row>0&&row<10){
                y=437.5+(9-row)*35
            }else if(row==10){
                //bike
                y=387
            }else if(row==11){
                //walk
                y=340
            }else if(row==12){
                y=306
            }else if(row==13){
                //train
                y=229
            }else if(row==14){
                //train
                y=148
            }else if(row==15){
                y=60
            }
            return y;
        }
        this.draw=function(){
            image(chicken,this.x,this.getYFromRow(this.row),20,20)
            if(keyIsPressed===false){
                this.keyWasPressed=false;
            }
            if(this.cooldown>0){
                this.cooldown-=1
            }
            if(this.touchingVehicles()){
                this.row=0
                cluck.play()
                deaths+=1;
            }
        }
        this.touchingVehicles=function(){
            if(this.row>0&&this.row<12){
                if(this.x>=vehicles[this.row-1].x&&this.x<=vehicles[this.row-1].x+vehicles[this.row-1].width){
                    return true
                }
            }else if(this.row>11&&this.row<15){
                if(this.x>=vehicles[this.row-2].x&&this.x<=vehicles[this.row-2].x+vehicles[this.row-2].width){
                    return true
                }
            }
            return false
        }
    }
    function Vehicle(r,row,time,speed){
        fill("white");
        this.id=r;
        this.row=row
        this.time=time;
        if(this.row>0&&this.row<10){
            this.commute="Car"
        }else if(this.row==10){
            this.commute="Bike"
        }else if(this.row==11){
            this.commute="Walk"
        }else if(this.row>11&&this.row<14){
            this.commute="Train"
        }
        this.offscreen=false;
        this.x=0;
        this.y=0;
        this.width=0;
        this.height=0;
        this.buffer=0;
        this.frame=0;
        this.speed=speed;
        this.showMoreInfo=false;
        this.mouseGotPressed=false;
        this.soundPlayed=false;
        if(this.commute=="Car"){
            this.sound=loadSound("car.mp3")
        }else if(this.commute=="Bike"){
            this.sound=loadSound("bike.mp3")
        }else if(this.commute=="Train"){
            this.sound=loadSound("train.mp3")
        }else if(this.commute=="Walk"){
            this.sound=loadSound("walking.mp3")
        }
        this.update=function(){
            if(((this.row==player.row+1&&this.row<12)||(this.row==player.row&&this.row>11))&&sound==1){
                if(1-(abs(this.x-player.x)/384)<0){
                    this.sound.setVolume(0)
                }else{
                    this.sound.setVolume(1-(abs(this.x-player.x)/384))
                }
            }else{
                this.sound.setVolume(0)
            }
            if(this.commute=="Car"){
                this.x=-50+(activeTime-this.time)*this.speed
                this.y=437.5+(9-((this.row-1)%9)-1)*35
                this.width=50;
                this.height=25;
            }else if(this.commute=="Walk"){
                this.x=-10+(activeTime-this.time)*this.speed
                //around 8
                this.y=306
                this.width=walk[(floor((abs(this.x/2) % 20.9)/3))].width/2
                this.height=walk[(floor((abs(this.x/2) % 20.9)/3))].height/2
            }else if(this.commute=="Bike"){
                this.x=-10+(activeTime-this.time)*this.speed
                //around 17
                this.y=387
                this.width= 60
                this.height=20
            }else if(this.commute=="Train"){
                this.x=-10+(activeTime-this.time)*this.speed
                //around 25
                if(this.row==13){
                    this.y=148
                }else{
                    this.y=229
                }
                this.width=230
                this.height=40    
            }
            if(this.x<-50||this.x>768||abs(this.row-player.row)>8){
                this.offscreen=true;
            }else{
                this.offscreen=false;
            }
            if(this.x>768){
                this.time=activeTime+1
                this.id+=9;
                this.speed=random(15,40)
                this.soundPlayed=false;
                if(abs(this.row-player.row)<8&&sound==1){
                    this.sound.stop()
                    this.sound.loop()
                }
            }
        }
        this.draw=function(){
            if((this.row==player.row&&this.row<12)||(this.row==player.row-1&&this.row>11)){
                var distance=100;
                if(this.commute=="Car"){
                    distance=100
                }else if(this.commute=="Bike"){
                    distance=200
                }else if(this.commute=="Train"){
                    distance=200
                }else if(this.commute=="Walk"){
                    distance=150
                }
                if(player.x-this.x<distance+this.width&&player.x-this.x>0+this.width&&this.soundPlayed==false){
                    if(this.commute=="Car"&&sound==1){
                        sounds[0].play()
                    }else if(this.commute=="Bike"&&sound==1){
                        sounds[1].play()
                    }else if(this.commute=="Train"&&sound==1){
                        sounds[3].play()
                    }else if(this.commute=="Walk"&&sound==1){
                        sounds[2].play()
                    }
                    this.soundPlayed=true;
                }
            }
            if(this.frame==0){
                if(abs(this.row-player.row)<8&&sound==1){
                    this.sound.loop()
                }
            }
            if(!this.offscreen){
                if(this.commute=="Car"){
                    tint(carCombos[r][0])
                    //image(cars[carCombos[r][1]],r*50,437.5,50,25)
                    image(cars[carCombos[this.id % 150][1]],this.x,this.y,50,25)
                    noTint()
                }else if(this.commute=="Walk"){
                    tint("white")
                    //image(walk[abs(floor((this.x % 18)/3))],this.x,this.y)
                    image(walk[(floor((abs(this.x/2) % 20.9)/3))],this.x,this.y,this.width,this.height)
                    noTint()
                }else if(this.commute=="Bike"){
                    image(biker,this.x,this.y,this.width,this.height)
                }else if(this.commute=="Train"){
                    image(train,this.x,this.y,this.width,this.height)
                }
                //rect(this.x,this.y,this.width,this.height)
                this.frame++;
            }
        }
    }
    if(playing){
        if(frame==0){
            //initializing vehicles
            player=new Player(384,0)
            for(let r=0;r<13;r++){
                if(r<9){
                    vehicles.push(new Vehicle(r,r+1,random(2,15),random(15,40)));
                }else if(r==9){
                    vehicles.push(new Vehicle(0,r+1,random(2,15),random(20,30)));
                }else if(r==10){
                    vehicles.push(new Vehicle(0,r+1,random(2,15),random(5,10)));
                }else if(r>10){
                    vehicles.push(new Vehicle(0,r+1,random(2,15),random(20,75)));
                }
                vehicles[vehicles.length-1].update()
            }
        }else{
            outputVolume(sound)
            if(player!=0){
                player.draw()
            }
            showVehicles()
            if(visual==0){
                background(0,0,0,245)
            }
            fill("white")
            textSize(30)
            text(30-round((millis()-startTime)/1000),40,50)
            textSize(25)
            text("Score: "+round((score/15)*100)+"%",40,85)
            text("Best Score: "+round((bestScore/15)*100)+"%",40,110)
            activeTime+=0.15*playSpeed;
            score=player.row;
            if(score>bestScore){
                bestScore=score;
            }
            if(keyIsDown(UP_ARROW)&&!player.keyWasPressed&&frame>20&&player.cooldown==0){
                if(player.row<15){
                    player.row+=1
                }
                player.keyWasPressed=true;
                player.cooldown=coolDown;
            }
            if(keyIsDown(DOWN_ARROW)&&!player.keyWasPressed&&frame>20&&player.cooldown==0){
                if(player.row>0){
                    player.row-=1
                }
                player.keyWasPressed=true;
                player.cooldown=coolDown;
            }
            if(keyIsDown(LEFT_ARROW)&&frame>20){
                player.x-=1;
            }else if(keyIsDown(RIGHT_ARROW)&&frame>20){
                player.x+=1;
            }
            if(player.row==15){
                playing=false;
                player.row=20;
                win=true;
                endTime=round((millis()-startTime)/1000)
                bestScore=15;
                bestScores.push(bestScore)
                deathCounts.push(deaths)
            }
            if((millis()-startTime)/1000>=30){
                playing=false;
                player.row=20;
                endTime=round((millis()-startTime)/1000)
                bestScores.push(bestScore)
                deathCounts.push(deaths)
            }
        }
    }else{
            outputVolume(0)
            for(let i=0;i<vehicles.length;i++){
                vehicles[i].sound.stop()
            }
            if(phase<5&&phase>0){
            background(130,165,100,230)
            fill("white")
            textSize(60)
            if(win==true){
                text("You Won!",280,200)
            }else{
                text("Good Job!",280,200)
            }
            textSize(40)
            text("Best Score: "+round((bestScore/15)*100)+"%",230,400)
            text("Time: "+endTime+"s",230,300)
            textSize(30)
            text("Click anywhere to continue",200,700)
        }
        if(phase==0){
            background(130,165,100,230)
            fill("white")
            textSize(60)
            text("Biology Game",220,200)
            textSize(30)
            text("Click anywhere to continue",255,700)
        }else if(phase==1){
            textSize(25)
            text("Now, try again, with a little twist: No sound!",180,600)
        }else if(phase==2){
            textSize(25)
            text("Now... sound is the only thing you have!",180,600)
        }else if(phase==3){
            textSize(25)
            text("No sound or sight. Good luck!",180,600)
        }else if(phase==4){
            textSize(25)
            text("You're done! Now, copy the text appearing once the screen is clicked.",60,600)
            var newText=""
            for(let i=0;i<4;i++){
                if(str(bestScores[i]).length==1){
                    newText=newText+"0"+bestScores[i]+" "
                }else{
                    newText=newText+bestScores[i]+" "
                }
            }
            for(let i=0;i<4;i++){
                if(str(deathCounts[i]).length==1){
                    newText=newText+"0"+deathCounts[i]+" "
                }else{
                    newText=newText+deathCounts[i]+" "
                }
            }
            console.log(newText)
        }else if(phase==5){
            background(130,165,100,200)
            textSize(30)
            text("Thanks for playing!",180,400)
        }

        if(mouseIsPressed&&phase<4){
            outputVolume(1)
            startTime=millis()
            activeTime=0.1;
            carCombos=[];
            frame=-1;
            vehicles=[];
            playing=true;
            win=false;
            coolDown=20;
            playSpeed=1;
            phase+=1;
            bestScore=0;
            score=0;
            endTime=0;
            deaths=0;
            if(phase==2){
                sound=0;
                visual=1;
            }else if(phase==3){
                sound=1;
                visual=0;
            }else if(phase==4){
                sound=0;
                visual=0;
            }
            console.log("skibidi")
        }else if(mouseIsPressed&&phase==4){
            alert("Copy the following text (⌘C): "+ newText)
            alert("Then, click on the button below to submit it to the Google Form")
            phase+=1;
        }
    }
    //displayCarCombos();
    frame+=1;
}
