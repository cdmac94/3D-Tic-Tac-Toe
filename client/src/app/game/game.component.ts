import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as BABYLON from 'babylonjs';
import { ColyseusService } from '../colyseus.service';
import { GameLogic } from './gamelogic';
import { Subscription } from 'rxjs';
import { Status } from './gamestate';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  standalone: true,
  imports: [CommonModule], // Include CommonModule
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {
  private canvas!: HTMLCanvasElement;
  private engine!: BABYLON.Engine;
  private scene!: BABYLON.Scene;
  private playerNumberSubscription!: Subscription;
  private cubes: BABYLON.Mesh[] = []; // Store references to the cubes
  playerNumber: number = 0; // Ensure default value
  gameState: Status = 0; // Ensure default value

  constructor(
    private route: ActivatedRoute,
    private colyseusService: ColyseusService,
    private gameLogic: GameLogic
  ) {}

  ngOnInit(): void {

    // Subscribe to player number updates
    this.playerNumberSubscription = this.colyseusService.playerNumber$.subscribe(number => {
      this.playerNumber = number!;
    });

    this.colyseusService.getRoom().onMessage('new gamefield', (message: number[]) => {
      this.updateCubeColors(message);
    });

    this.colyseusService.getRoom().onMessage('gameStatus', (message: number) => {
      this.gameState = message;
    });
  }

  ngAfterViewInit(): void {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.createScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  createScene(): void {
    // Create a Babylon Scene
    this.scene = new BABYLON.Scene(this.engine);
    this.engine.resize();

    // Create an Arc Rotate Camera and position it to focus on the grid
    let camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 2, 20, new BABYLON.Vector3(0, 0, 0), this.scene);
    camera.attachControl(this.canvas, false);

    // Create a Hemispheric Light
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;
    var light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(1, -10, 1), this.scene);
    light2.intensity = 0.7;

    // Create a tic-tac-toe board
    const boardSize = 3;
    const cubeSize = 2;
    const spaceBetweenCubes = 1;

    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const cube = BABYLON.MeshBuilder.CreateBox("cube_" + i + "_" + j, { size: cubeSize }, this.scene);

        // Assign material to each cube
        var material = new BABYLON.StandardMaterial("mat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.22, 0.45, 0.78);
        cube.material = material;

        cube.position.x = 0;
        cube.position.y = (i - (boardSize - 1) / 2) * (cubeSize + spaceBetweenCubes);
        cube.position.z = (j - (boardSize - 1) / 2) * (cubeSize + spaceBetweenCubes);

        // Add a custom property to track whether the cube is selectable
        (cube as any).selectable = true;

        this.cubes.push(cube); // Store reference to cube
      }
    }

    this.scene.onPointerDown = (event, pickResult) => {

      let playerNumber = this.playerNumber
      let gameState: Status = this.gameState;

      if (pickResult.hit) {
        const mesh = pickResult.pickedMesh as BABYLON.Mesh;

        if (!(mesh as any).selectable) {
          alert("This cube is already picked and unselectable!");
          return;
        }

        if(gameState === 6){
          alert("The game hasn't started yet!");
          return;
        }

        if(playerNumber === 1 && gameState === 2 ){
          alert("Not your turn!");
          return;
        }

        if(playerNumber === 2 && gameState === 1){
          alert("Not your turn!");
          return;
        }

        if(gameState === 3 || gameState === 4 || gameState === 5){
          alert("The game is already over!");
          return;
        }

        if ((mesh as any).selectable){
          let pickIndex = this.gameLogic.getIndex(mesh.id);
          this.gameLogic.updateLocalGamefield(this.playerNumber, pickIndex);
          const material = mesh.material as BABYLON.StandardMaterial;

          if (this.playerNumber === 1) {
            material.diffuseColor = new BABYLON.Color3(1, 0, 0);
            this.checkBoard(1);
          } else if (this.playerNumber === 2) {
            material.diffuseColor = new BABYLON.Color3(0, 0, 1);
            this.checkBoard(2);
          }

          // Animate the cube
          this.animateCube(mesh);
        } else {
          console.error('Mesh material is not a StandardMaterial');
        }
      }
    };
  }

  animateCube(cube: BABYLON.Mesh): void {
    // Create the scaling animation
    let scaleAnimation = new BABYLON.Animation(
      "shrinkBounce",
      "scaling",
      30,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );

    // Scaling animation keys
    let scaleKeys = [
      { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
      { frame: 5, value: new BABYLON.Vector3(0.5, 0.5, 0.5) },
      { frame: 10, value: new BABYLON.Vector3(1, 1, 1) }
    ];

    scaleAnimation.setKeys(scaleKeys);

    // Create the rotation animation
    let rotateAnimation = new BABYLON.Animation(
      "spin",
      "rotation.y",
      30,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );

    // Rotation animation keys
    let rotateKeys = [
      { frame: 0, value: 0 },
      { frame: 5, value: Math.PI },
      { frame: 15, value: Math.PI * 2 }
    ];

    rotateAnimation.setKeys(rotateKeys);

    // Attach the animations to the cube
    cube.animations = [];
    cube.animations.push(scaleAnimation);
    cube.animations.push(rotateAnimation);

    // Run the animations
    this.scene.beginAnimation(cube, 0, 15, false);
  }


  updateCubeColors(gamefield: number[]): void {
    for (let i = 0; i < gamefield.length; i++) {
      const cube = this.cubes[i];
      const value = gamefield[i];

      if (cube.material instanceof BABYLON.StandardMaterial) {
        const material = cube.material as BABYLON.StandardMaterial;
        if (value === 1) {
          material.diffuseColor = new BABYLON.Color3(1, 0, 0);
          this.animateCube(cube);
          (cube as any).selectable = false; // Mark the cube as unselectable
        } else if (value === 2) {
          material.diffuseColor = new BABYLON.Color3(0, 0, 1);
          this.animateCube(cube);
          (cube as any).selectable = false; // Mark the cube as unselectable
        }
      }
    }
  }

  checkBoard(playerNumber: number){
    let statusEnum: Status  = this.gameState;

    if(this.gameLogic.checkWin(1, this.gameLogic.gamefield)){
      statusEnum = Status.PLYRONEW;
    } else if(this.gameLogic.checkDraw(this.gameLogic.gamefield)){
      statusEnum = Status.DRAW;
    } else {
      if (playerNumber === 1){
        statusEnum = Status.PLYRTWO;
      } else if (playerNumber === 2){
        statusEnum = Status.PLYRONE;
      }
    }
    this.colyseusService.sendScore("gamefield", this.gameLogic.gamefield);
    this.colyseusService.sendStatus('gameStatus', statusEnum);
  }


  // function to leave room and redirect home
  leaveRoom(): void {
    this.colyseusService.leaveRoom();
    // close babylon scene and remove game component
    this.engine.dispose();
    this.engine = null!;
    // Redirect to home page
    window.location.href = '/';
    alert("You have left the room!");
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.playerNumberSubscription) {
      this.playerNumberSubscription.unsubscribe();
    }
  }
}
