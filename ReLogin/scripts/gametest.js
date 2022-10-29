import { world } from "mojang-minecraft";

//入ってきた時に行う処理
function onJoin(player) {
  //Tagが存在しなかった用の仮Tag
  player.addTag("Dummy");
  // 条件変数
  let detect = (element) => element.includes("ReLogin(") == false;
  //PlayerのTagを一つずつ取り出す
  for (let tag of player.getTags()) {
      //ログイン2回目、3回目の為の(n)を配備
      if (player.hasTag("Login") == true && tag.includes("ReLogin(") == false) {
        player.addTag("ReLogin(1)");
        player.removeTag("Login");
        player.runCommand("tellraw @a {\"rawtext\":[{\"text\":\"リログインです。\"}]}");
      }
      //ログイン3回目以降
      if (tag.includes("ReLogin(")) {
        let count = tag.slice(8, -1);
        player.addTag(`ReLogin(${Number(count) + 1})`);
        player.removeTag(`ReLogin(${count})`);
        player.runCommand(`tellraw @a {\"rawtext\":[{\"text\":\"リログイン[${Number(count) + 1}回目]です。\"}]}`);
      }
      //初ログイン
      if(player.hasTag("Login") == false && player.getTags().every(detect)) {
      player.addTag("Login");
      player.runCommand("tellraw @a {\"rawtext\":[{\"text\":\"初ログインです。\"}]}");
    }
  }
  //仮Tag消去
  player.removeTag("Dummy");
}

//プレイヤー情報が二重にならない用のSet変数
const joining = new Set();
//ワールド入った時にsetに入れる
world.events.playerJoin.subscribe(ev => joining.add(ev.player));
world.events.tick.subscribe(() => {
  //Set変数から一個ずつ
  joining.forEach(player => {
    //ワールドに完全に入ったことを検知
    try {
      //これがErrorだと catchへ
      player.runCommand('testfor @s');
      //一回のみ
      joining.delete(player);
      onJoin(player);
    } catch { }
  });

  for(let player of world.getPlayers()){
    for(let tag3 of player.getTags()){
      //ログインTag一括削除
      if(player.getTags().includes("LoginReset")){
        player.removeTag("LoginReset");
        player.removeTag("Login");
        if (tag3.includes("ReLogin(")) {
          let count = tag3.slice(8, -1);
          player.removeTag(`ReLogin(${count})`);
        }
      }
    }
  }
});