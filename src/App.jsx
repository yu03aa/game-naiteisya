import React, { useState, useEffect } from 'react';
import { Sword, Shield, Zap, Heart } from 'lucide-react';

const TurnBasedRPG = () => {
  // ========== State定義 ==========
  const [gameState, setGameState] = useState('classSelect');
  const [selectedClass, setSelectedClass] = useState(null);
  const [player, setPlayer] = useState(null);
  const [enemy, setEnemy] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [selectedAction, setSelectedAction] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const [isDefending, setIsDefending] = useState(false);
  const [activeBuffs, setActiveBuffs] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [usedQuizIds, setUsedQuizIds] = useState([]);
  const [victoryRank, setVictoryRank] = useState(null);
  const [savedProgress, setSavedProgress] = useState(() => {
    const saved = localStorage.getItem('rpgProgress');
    return saved ? JSON.parse(saved) : { bestRank: null, completedStages: [] };
  });

  // ========== データ定義 ==========
  const classes = {
    warrior: {
      name: 'ふっきー',
      sprite: './fukky.png',
      isImage: true,
      job: 'エンジニア',
      team: 'Qiita',
      description: '高いHPと攻撃力を持つ前衛職',
      baseStats: {
        maxHp: 120,
        hp: 120,
        attack: 25,
        defense: 15,
        mp: 30,
        maxMp: 30,
        level: 1,
        exp: 0
      },
      skills: [
        { name: '強撃', mpCost: 10, damage: 40, type: 'attack', description: '強力な一撃' },
        { name: '鉄壁', mpCost: 15, buff: 'defense', value: 2, turns: 3, type: 'buff', description: '3ターン防御力2倍' },
        { name: '剣の舞', mpCost: 20, damage: 30, hits: 2, type: 'multi', description: '2回連続攻撃' }
      ]
    },
    mage: {
      name: 'ぐっちー',
      sprite: './gultuti.png',
      isImage: true,
      job: '営業',
      team: 'ハナユメ',
      description: '強力な魔法攻撃と回復魔法を使える',
      baseStats: {
        maxHp: 120,
        hp: 120,
        attack: 25,
        defense: 15,
        mp: 30,
        maxMp: 30,
        level: 1,
        exp: 0
      },
      skills: [
        { name: 'ファイアボール', mpCost: 15, damage: 50, type: 'magic', description: '火炎魔法' },
        { name: '回復魔法', mpCost: 20, heal: 50, type: 'heal', description: 'HPを回復' },
        { name: 'サンダーボルト', mpCost: 30, damage: 70, type: 'magic', description: '雷魔法' },
        { name: 'メテオ', mpCost: 40, damage: 90, type: 'magic', description: '最強魔法' }
      ]
    },
    thief: {
      name: 'すえちゃん',
      sprite: './sue.png',
      isImage: true,
      job: 'デザイナー',
      team: 'ウェルネス',
      description: '素早い攻撃とトリッキーな技が得意',
      baseStats: {
        maxHp: 120,
        hp: 120,
        attack: 25,
        defense: 15,
        mp: 30,
        maxMp: 30,
        level: 1,
        exp: 0
      },
      skills: [
        { name: '急所突き', mpCost: 12, damage: 45, crit: 0.5, type: 'attack', description: '50%で2倍ダメージ' },
        { name: '盗む', mpCost: 10, steal: true, type: 'steal', description: 'アイテムを盗む' },
        { name: '影分身', mpCost: 18, damage: 25, hits: 3, type: 'multi', description: '3回連続攻撃' },
        { name: '煙幕', mpCost: 15, evade: 2, turns: 2, type: 'buff', description: '2ターン回避率上昇' }
      ]
    },
    priest: {
      name: 'あささ',
      sprite: './asasa.png',
      isImage: true,
      job: 'デザイナー',
      team: 'ウェルネス',
      description: '回復とサポートに特化した職業',
      baseStats: {
        maxHp: 120,
        hp: 120,
        attack: 25,
        defense: 15,
        mp: 30,
        maxMp: 30,
        level: 1,
        exp: 0
      },
      skills: [
        { name: 'ヒール', mpCost: 15, heal: 40, type: 'heal', description: 'HP回復' },
        { name: 'ホーリーライト', mpCost: 20, damage: 35, type: 'magic', description: '聖なる光' },
        { name: 'リジェネ', mpCost: 25, regen: 15, turns: 3, type: 'buff', description: '3ターンHP回復' },
        { name: 'フルヒール', mpCost: 40, heal: 999, type: 'heal', description: '完全回復' }
      ]
    }
  };

  const enemies = [
    { name: 'スーモンサーゼクシア', maxHp: 120, hp: 120, attack: 10, defense: 5, exp: 20, gold: 30, sprite: './rasubosu.png', isImage: true },
    { name: 'ゴブリン', maxHp: 120, hp: 120, attack: 15, defense: 8, exp: 35, gold: 50, sprite: './rasubosu.png', isImage: true },
    { name: 'オーク', maxHp: 120, hp: 120, attack: 25, defense: 12, exp: 50, gold: 80, sprite: './rasubosu.png', isImage: true },
    { name: 'ドラゴン', maxHp: 120, hp: 120, attack: 35, defense: 20, exp: 100, gold: 200, sprite: './rasubosu.png', isImage: true }
  ];

  const quizzes = [
    {
      id: 1,
      question: 'JavaScriptで変数を宣言するキーワードはどれ？',
      options: ['var', 'int', 'string', 'float'],
      correctAnswer: 0
    },
    {
      id: 2,
      question: 'HTMLの略称は何？',
      options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
      correctAnswer: 0
    },
    {
      id: 3,
      question: 'CSSで色を指定する方法として正しくないものは？',
      options: ['#FF0000', 'rgb(255,0,0)', 'red', 'color(255,0,0)'],
      correctAnswer: 3
    },
    {
      id: 4,
      question: 'Reactのフックで状態管理に使うのは？',
      options: ['useState', 'useEffect', 'useContext', 'useReducer'],
      correctAnswer: 0
    },
    {
      id: 5,
      question: 'GitHubの主な用途は？',
      options: ['バージョン管理', '画像編集', '動画編集', '音楽制作'],
      correctAnswer: 0
    },
    {
      id: 6,
      question: 'HTTPステータスコード404の意味は？',
      options: ['Not Found', 'Server Error', 'OK', 'Forbidden'],
      correctAnswer: 0
    },
    {
      id: 7,
      question: 'SQLでデータを取得するコマンドは？',
      options: ['SELECT', 'GET', 'FETCH', 'RETRIEVE'],
      correctAnswer: 0
    },
    {
      id: 8,
      question: 'Pythonのファイル拡張子は？',
      options: ['.py', '.python', '.pt', '.pyt'],
      correctAnswer: 0
    },
    {
      id: 9,
      question: 'APIの略称は何？',
      options: ['Application Programming Interface', 'Advanced Programming Interface', 'Application Process Interface', 'Automated Programming Interface'],
      correctAnswer: 0
    },
    {
      id: 10,
      question: 'JSONのデータ形式として正しいのは？',
      options: ['{"name": "value"}', '<name>value</name>', 'name=value', 'name:value'],
      correctAnswer: 0
    }
  ];

  // ========== ユーティリティ関数 ==========
  const calculateDamage = (attacker, defender, baseAttack, isDefending = false) => {
    const defenseMod = isDefending ? defender.defense * 2 : defender.defense;
    const baseDamage = baseAttack - defenseMod;
    const randomVariance = Math.floor(Math.random() * 10) - 5;
    const finalDamage = Math.max(1, baseDamage + randomVariance);
    return finalDamage;
  };

  const addLog = (message) => {
    setBattleLog([message]);
  };

  // ========== ゲームロジック関数 ==========
  const selectClass = (classKey) => {
    const selectedClassData = classes[classKey];
    setPlayer({
      ...selectedClassData.baseStats,
      className: selectedClassData.name,
      classSprite: selectedClassData.sprite,
      isImage: selectedClassData.isImage || false,
      classKey: classKey
    });
    setSelectedClass(classKey);
    setGameState('menu');
  };

  const getRandomQuiz = () => {
    const availableQuizzes = quizzes.filter(q => !usedQuizIds.includes(q.id));
    if (availableQuizzes.length === 0) {
      setUsedQuizIds([]);
      return quizzes[Math.floor(Math.random() * quizzes.length)];
    }
    return availableQuizzes[Math.floor(Math.random() * availableQuizzes.length)];
  };

  const answerQuiz = (selectedIndex) => {
    if (!isPlayerTurn || !enemy || !currentQuiz) return;

    if (selectedIndex === currentQuiz.correctAnswer) {
      // 正解の場合：敵に30ダメージ、プレイヤーはノーダメージ
      const damage = 30;
      const newEnemyHp = Math.max(0, enemy.hp - damage);
      setEnemy(prev => ({ ...prev, hp: newEnemyHp }));
      addLog(`正解！ ${enemy.name}に${damage}のダメージ！`);

      if (newEnemyHp <= 0) {
        handleVictory();
        return;
      }

      // 次のクイズを準備
      const nextQuiz = getRandomQuiz();
      setCurrentQuiz(nextQuiz);
      setUsedQuizIds(prev => [...prev, nextQuiz.id]);
      
      // プレイヤーターンを継続（敵ターンなし）
      setIsPlayerTurn(true);
    } else {
      // 不正解の場合：敵にダメージなし、プレイヤーが20ダメージ受ける
      addLog(`不正解... 正解は「${currentQuiz.options[currentQuiz.correctAnswer]}」でした`);
      
      const damage = 20;
      const newPlayerHp = Math.max(0, player.hp - damage);
      setPlayer(prev => ({ ...prev, hp: newPlayerHp }));
      addLog(`${damage}のダメージを受けた！`);

      if (newPlayerHp <= 0) {
        setTimeout(() => setGameState('defeat'), 1000);
        return;
      }

      // 次のクイズを準備
      const nextQuiz = getRandomQuiz();
      setCurrentQuiz(nextQuiz);
      setUsedQuizIds(prev => [...prev, nextQuiz.id]);
      
      // プレイヤーターンを継続（敵ターンなし）
      setIsPlayerTurn(true);
    }
  };

  const startBattle = () => {
    const randomEnemy = enemies[0]; // レベル1の敵を固定
    setEnemy({ ...randomEnemy, hp: randomEnemy.maxHp });
    const quiz = getRandomQuiz();
    setCurrentQuiz(quiz);
    setUsedQuizIds(prev => [...prev, quiz.id]);
    setGameState('battle');
    setBattleLog([`${randomEnemy.name}が現れた！`, 'クイズに答えて攻撃しよう！']);
    setIsPlayerTurn(true);
    setTurnCount(0);
    setIsDefending(false);
    setActiveBuffs([]);
  };

  const playerAttack = () => {
    if (!isPlayerTurn || !enemy) return;
    
    const damage = calculateDamage(player, enemy, player.attack, false);
    const newEnemyHp = Math.max(0, enemy.hp - damage);
    
    setEnemy(prev => ({ ...prev, hp: newEnemyHp }));
    addLog(`${player.className}の攻撃！ ${enemy.name}に${damage}のダメージ！`);
    
    if (newEnemyHp <= 0) {
      handleVictory();
      return;
    }
    
    endPlayerTurn();
  };

  const playerDefend = () => {
    if (!isPlayerTurn) return;
    
    setIsDefending(true);
    addLog(`${player.className}は防御態勢をとった！`);
    endPlayerTurn();
  };

  const playerSkill = (skill) => {
    if (!isPlayerTurn || !enemy || player.mp < skill.mpCost) return;
    
    setPlayer(prev => ({ ...prev, mp: prev.mp - skill.mpCost }));
    
    if (skill.type === 'heal') {
      const healAmount = Math.min(skill.heal, player.maxHp - player.hp);
      setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount) }));
      addLog(`${skill.name}を使った！ HPが${healAmount}回復した！`);
    } else if (skill.type === 'attack' || skill.type === 'magic') {
      let damage = calculateDamage(player, enemy, skill.damage, false);
      
      if (skill.crit && Math.random() < skill.crit) {
        damage *= 2;
        addLog(`会心の一撃！`);
      }
      
      const newEnemyHp = Math.max(0, enemy.hp - damage);
      setEnemy(prev => ({ ...prev, hp: newEnemyHp }));
      addLog(`${skill.name}！ ${enemy.name}に${damage}のダメージ！`);
      
      if (newEnemyHp <= 0) {
        handleVictory();
        setSelectedAction(null);
        return;
      }
    } else if (skill.type === 'buff') {
      const buff = {
        type: skill.buff || (skill.regen ? 'regen' : 'evade'),
        value: skill.value || skill.regen || skill.evade,
        turns: skill.turns
      };
      setActiveBuffs(prev => [...prev, buff]);
      addLog(`${skill.name}！ ${skill.description}`);
    } else if (skill.type === 'multi') {
      let totalDamage = 0;
      for (let i = 0; i < skill.hits; i++) {
        const damage = calculateDamage(player, enemy, skill.damage, false);
        totalDamage += damage;
      }
      const newEnemyHp = Math.max(0, enemy.hp - totalDamage);
      setEnemy(prev => ({ ...prev, hp: newEnemyHp }));
      addLog(`${skill.name}！ ${skill.hits}回攻撃で合計${totalDamage}のダメージ！`);
      
      if (newEnemyHp <= 0) {
        handleVictory();
        setSelectedAction(null);
        return;
      }
    } else if (skill.type === 'steal') {
      addLog(`盗むを使った！`);
    }
    
    setSelectedAction(null);
    endPlayerTurn();
  };

  const endPlayerTurn = () => {
    setIsPlayerTurn(false);
    setTurnCount(prev => prev + 1);
  };

  const enemyTurn = () => {
    if (isPlayerTurn || !enemy || enemy.hp <= 0) return;
    
    setTimeout(() => {
      const regenBuff = activeBuffs.find(b => b.type === 'regen');
      if (regenBuff) {
        const regenAmount = regenBuff.value;
        setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + regenAmount) }));
        addLog(`リジェネでHPが${regenAmount}回復！`);
      }
      
      const evadeBuff = activeBuffs.find(b => b.type === 'evade');
      if (evadeBuff && Math.random() < 0.5) {
        addLog(`${enemy.name}の攻撃を回避した！`);
      } else {
        const defenseBuff = activeBuffs.find(b => b.type === 'defense');
        const defenseMultiplier = defenseBuff ? defenseBuff.value : 1;
        const effectiveDefense = player.defense * defenseMultiplier;
        const tempPlayer = { ...player, defense: effectiveDefense };
        
        const damage = calculateDamage(enemy, tempPlayer, enemy.attack, isDefending);
        const newPlayerHp = Math.max(0, player.hp - damage);
        
        setPlayer(prev => ({ ...prev, hp: newPlayerHp }));
        addLog(`${enemy.name}の攻撃！ ${damage}のダメージを受けた！`);
        
        if (newPlayerHp <= 0) {
          setTimeout(() => setGameState('defeat'), 1000);
          return;
        }
      }
      
      setActiveBuffs(prev => {
        const updated = prev.map(buff => ({ ...buff, turns: buff.turns - 1 }));
        const active = updated.filter(buff => buff.turns > 0);
        
        const expired = updated.filter(buff => buff.turns <= 0);
        expired.forEach(buff => {
          const messages = {
            defense: '防御力上昇の効果が切れた',
            regen: 'リジェネの効果が切れた',
            evade: '回避率上昇の効果が切れた'
          };
          addLog(messages[buff.type]);
        });
        
        return active;
      });
      
      setIsDefending(false);
      setIsPlayerTurn(true);
    }, 1000);
  };

  const handleVictory = () => {
    const expGained = enemy.exp;
    addLog(`${enemy.name}を倒した！ ${expGained}の経験値を獲得！`);
    
    // HP残量でランク判定
    const hpPercentage = (player.hp / player.maxHp) * 100;
    let rank;
    if (hpPercentage >= 100) {
      rank = 'S';
    } else if (hpPercentage >= 80) {
      rank = 'A';
    } else if (hpPercentage >= 50) {
      rank = 'B';
    } else if (hpPercentage >= 30) {
      rank = 'C';
    } else if (hpPercentage >= 10) {
      rank = 'D';
    } else {
      rank = 'E';
    }
    
    setVictoryRank(rank);
    
    // 進行度を保存
    const newProgress = {
      bestRank: !savedProgress.bestRank || rank < savedProgress.bestRank ? rank : savedProgress.bestRank,
      completedStages: ['stage1'],
      lastClearDate: new Date().toISOString()
    };
    setSavedProgress(newProgress);
    localStorage.setItem('rpgProgress', JSON.stringify(newProgress));
    
    setPlayer(prev => {
      const newExp = prev.exp + expGained;
      const levelUp = newExp >= prev.level * 100;
      
      if (levelUp) {
        addLog(`レベルアップ！ レベル${prev.level + 1}になった！`);
        return {
          ...prev,
          level: prev.level + 1,
          exp: newExp - prev.level * 100,
          maxHp: prev.maxHp + 20,
          hp: prev.maxHp + 20,
          attack: prev.attack + 5,
          defense: prev.defense + 3,
          maxMp: prev.maxMp + 10,
          mp: prev.maxMp + 10
        };
      }
      return { ...prev, exp: newExp };
    });
    
    setTimeout(() => setGameState('victory'), 1500);
  };

  const resetGame = () => {
    setGameState('classSelect');
    setEnemy(null);
    setBattleLog([]);
    setSelectedAction(null);
    setSelectedClass(null);
    setPlayer(null);
    setActiveBuffs([]);
  };

  const continueAdventure = () => {
    startBattle();
  };

  // ========== Side Effect ==========
  useEffect(() => {
    if (!isPlayerTurn && gameState === 'battle' && enemy && enemy.hp > 0) {
      enemyTurn();
    }
  }, [isPlayerTurn]);

  // ========== UIコンポーネント ==========
  const HPBar = ({ current, max, color }) => {
    const percentage = (current / max) * 100;
    return (
      <div className="w-full bg-gray-700 h-6 rounded-lg overflow-hidden border-2 border-gray-600">
        <div 
          className={`h-full transition-all duration-500 ${color} flex items-center justify-center text-white text-sm font-bold`}
          style={{ width: `${percentage}%` }}
        >
          {current} / {max}
        </div>
      </div>
    );
  };

  // ========== 条件分岐レンダリング ==========
  if (gameState === 'classSelect') {
    return (
      <div 
        className="min-h-screen text-white p-4 flex items-center justify-center"
        style={{
          backgroundImage: 'url(./haikei.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="w-full max-w-md space-y-3 px-4 py-4">
          {Object.entries(classes).map(([key, classData]) => (
            <button
              key={key}
              onClick={() => selectClass(key)}
              className="w-full backdrop-blur-sm py-2 px-6 transition-all transform hover:scale-105 flex items-start justify-between"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                border: '4px solid #668FD2',
                borderRadius: '5px'
              }}
            >
              <div className="flex-1 text-left">
                <h2 className="text-3xl font-bold mb-3" style={{ color: 'white' }}>{classData.name}</h2>
                <div className="text-lg" style={{ color: 'white', fontSize: '1.21rem' }}>職業：{classData.job}</div>
                <div className="text-lg" style={{ color: 'white', fontSize: '1.21rem' }}>配属：{classData.team}</div>
              </div>
              <div className="flex-shrink-0 ml-4">
                {classData.isImage ? (
                  <img src={classData.sprite} alt={classData.name} style={{ width: '140px', height: '140px' }} className="object-contain" />
                ) : (
                  <div className="text-5xl">{classData.sprite}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <div 
        className="min-h-screen text-white flex items-center justify-center p-8"
        style={{
          backgroundImage: 'url(./haikei.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="backdrop-blur-sm p-8 max-w-md w-full mx-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: '4px solid #668FD2',
            borderRadius: '5px'
          }}
        >
          <div className="text-center">
            <div className="mb-4 flex justify-center items-center" style={{ height: '140px' }}>
              {player.isImage ? (
                <img src={player.classSprite} alt={player.className} style={{ width: '140px', height: '140px' }} className="object-contain" />
              ) : (
                <div className="text-6xl">{player.classSprite}</div>
              )}
            </div>
            <h2 className="text-5xl font-bold mb-6">{player.className}</h2>
            <div className="space-y-2 mb-8 text-center">
              <div>HP: {player.hp} / {player.maxHp}</div>
              <div>MP: {player.mp} / {player.maxMp}</div>
              <div>攻撃: {player.attack}</div>
              <div>防御: {player.defense}</div>
            </div>
            <div className="space-y-4">
              <button
                onClick={startBattle}
                className="w-full transition-all transform hover:scale-105"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                <img src="./boukennUI.png" alt="冒険に出発" style={{ width: '60%', margin: '0 auto', display: 'block' }} />
              </button>
              <button
                onClick={resetGame}
                className="w-full transition-all transform hover:scale-105"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                <img src="./modoruUI.png" alt="職業選択に戻る" style={{ width: '60%', margin: '0 auto', display: 'block' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'battle') {
    return (
      <div 
        className="min-h-screen text-white p-4"
        style={{
          backgroundImage: 'url(./haikei.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="backdrop-blur-sm p-6"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                border: '4px solid #668FD2',
                borderRadius: '5px'
              }}
            >
              <div className="mb-2 flex justify-center items-center" style={{ height: '140px' }}>
                {player.isImage ? (
                  <img src={player.classSprite} alt={player.className} style={{ width: '140px', height: '140px' }} className="object-contain" />
                ) : (
                  <div className="text-6xl">{player.classSprite}</div>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-2 text-center">{player.className}</h3>
              <div className="space-y-2">
                <HPBar current={player.hp} max={player.maxHp} color="bg-red-500" />
                <HPBar current={player.mp} max={player.maxMp} color="bg-blue-500" />
              </div>
              {activeBuffs.length > 0 && (
                <div className="mt-2 text-xs text-yellow-400">
                  {activeBuffs.map((buff, idx) => (
                    <div key={idx}>• {buff.type} (残り{buff.turns}ターン)</div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="backdrop-blur-sm p-6"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                border: '4px solid #668FD2',
                borderRadius: '5px'
              }}
            >
              <div className="mb-2 flex justify-center items-center" style={{ height: '140px' }}>
                {enemy.isImage ? (
                  <img src={enemy.sprite} alt={enemy.name} style={{ width: '140px', height: '140px' }} className="object-contain" />
                ) : (
                  <div className="text-6xl">{enemy.sprite}</div>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">{enemy.name}</h3>
              <HPBar current={enemy.hp} max={enemy.maxHp} color="bg-red-500" />
            </div>
          </div>
          
          <div className="backdrop-blur-sm p-4 mb-5 h-48 overflow-y-auto"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              border: '4px solid #668FD2',
              borderRadius: '5px'
            }}
          >
            <div className="space-y-1 text-sm">
              {battleLog.map((log, idx) => (
                <div key={idx} className="text-white">{log}</div>
              ))}
            </div>
          </div>
          
          {!isPlayerTurn ? (
            <div className="text-center text-yellow-400 font-bold text-xl animate-pulse">
              敵のターン...
            </div>
          ) : currentQuiz ? (
            <div className="space-y-3">
              <div className="backdrop-blur-sm p-6"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  border: '4px solid #668FD2',
                  borderRadius: '5px'
                }}
              >
                <h3 className="text-2xl font-bold mb-4 text-center text-yellow-400">クイズ</h3>
                <p className="text-xl mb-6 text-center">{currentQuiz.question}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {currentQuiz.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => answerQuiz(idx)}
                    className="backdrop-blur-sm py-8 px-6 font-bold transition-all transform hover:scale-105 text-left"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      border: '4px solid #668FD2',
                      borderRadius: '5px',
                      color: 'white',
                      minHeight: '80px',
                      fontSize: '1.58rem'
                    }}
                  >
                    {String.fromCharCode(65 + idx)}. {option}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  onClick={() => {
                    if (!isPlayerTurn || player.mp < 15) return;
                    
                    setPlayer(prev => ({ ...prev, mp: prev.mp - 15 }));
                    const damage = 30;
                    const newEnemyHp = Math.max(0, enemy.hp - damage);
                    setEnemy(prev => ({ ...prev, hp: newEnemyHp }));
                    addLog(`必殺技！ ${enemy.name}に${damage}のダメージ！`);
                    
                    if (newEnemyHp <= 0) {
                      handleVictory();
                      return;
                    }
                    
                    // MP消費時は敵のターンをスキップ
                    setIsPlayerTurn(true);
                  }}
                  disabled={!isPlayerTurn || player.mp < 15}
                  className="backdrop-blur-sm p-6 transition-all transform hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    border: '4px solid #668FD2',
                    borderRadius: '5px',
                    opacity: (!isPlayerTurn || player.mp < 15) ? 0.5 : 1
                  }}
                >
                  <div className="text-center">
                    <div className="text-xl font-bold mb-2" style={{ color: 'white' }}>必殺技</div>
                    <div className="text-sm mb-3" style={{ color: 'white' }}>消費MP：15</div>
                    <div className="flex justify-center">
                      <img src="./hiltukosi.png" alt="必殺技" style={{ width: '100px', height: '100px' }} className="object-contain" />
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    if (!isPlayerTurn || player.mp < 15) return;
                    
                    setPlayer(prev => ({ ...prev, mp: prev.mp - 15 }));
                    const healAmount = Math.min(20, player.maxHp - player.hp);
                    setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount) }));
                    addLog(`回復！ HPが${healAmount}回復した！`);
                    
                    // MP消費時は敵のターンをスキップ
                    setIsPlayerTurn(true);
                  }}
                  disabled={!isPlayerTurn || player.mp < 15}
                  className="backdrop-blur-sm p-6 transition-all transform hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    border: '4px solid #668FD2',
                    borderRadius: '5px',
                    opacity: (!isPlayerTurn || player.mp < 15) ? 0.5 : 1
                  }}
                >
                  <div className="text-center">
                    <div className="text-xl font-bold mb-2" style={{ color: 'white' }}>回復</div>
                    <div className="text-sm mb-3" style={{ color: 'white' }}>消費MP：15</div>
                    <div className="flex justify-center">
                      <img src="./nabi.png" alt="回復" style={{ width: '100px', height: '100px' }} className="object-contain" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (gameState === 'victory') {
    return (
      <div 
        className="min-h-screen text-white flex items-center justify-center p-8"
        style={{
          backgroundImage: 'url(./haikei.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="backdrop-blur-sm p-8 max-w-md w-full text-center mx-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: '4px solid #668FD2',
            borderRadius: '5px'
          }}
        >
          <h1 className="text-5xl font-bold mb-6 text-yellow-400">勝利</h1>
          <div className="font-bold mb-6" style={{ 
            fontSize: '7.7rem',
            color: victoryRank === 'S' ? '#FFD700' : 
                   victoryRank === 'A' ? '#C0C0C0' : 
                   victoryRank === 'B' ? '#CD7F32' : 
                   victoryRank === 'C' ? '#87CEEB' : 
                   victoryRank === 'D' ? '#90EE90' : '#808080'
          }}>
            ランク: {victoryRank}
          </div>
          <div className="space-y-2 mb-8">
            <div className="text-2xl">{player.className}</div>
            <div>HP残量: {player.hp} / {player.maxHp} ({Math.round((player.hp / player.maxHp) * 100)}%)</div>
            <div className="text-sm text-gray-300 mt-4 pt-4 border-t border-gray-600">
              <div>Sランク: 100%</div>
              <div>Aランク: 80%以上</div>
              <div>Bランク: 50%以上</div>
              <div>Cランク: 30%以上</div>
              <div>Dランク: 10%以上</div>
              <div>Eランク: 敗北</div>
            </div>
          </div>
          <div className="space-y-4">
            <button
              onClick={continueAdventure}
              className="w-full transition-all transform hover:scale-105"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <img src="./saityousennUI.png" alt="再挑戦" style={{ width: '60%', margin: '0 auto', display: 'block' }} />
            </button>
            <button
              onClick={resetGame}
              className="w-full transition-all transform hover:scale-105"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <img src="./menyuUI.png" alt="メニューに戻る" style={{ width: '60%', margin: '0 auto', display: 'block' }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'defeat') {
    return (
      <div 
        className="min-h-screen text-white flex items-center justify-center p-8"
        style={{
          backgroundImage: 'url(./haikei.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="backdrop-blur-sm p-8 max-w-md w-full text-center mx-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: '4px solid #668FD2',
            borderRadius: '5px'
          }}
        >
          <h1 className="text-5xl font-bold mb-6 text-red-500">敗北</h1>
          <div className="font-bold mb-6" style={{ fontSize: '7.7rem', color: '#808080' }}>
            ランク: E
          </div>
          <div className="space-y-2 mb-8">
            <div className="text-2xl">{player.className}</div>
            <div>HP残量: 0 / {player.maxHp} (0%)</div>
            <div className="text-sm text-gray-300 mt-4 pt-4 border-t border-gray-600">
              <div>Sランク: 100%</div>
              <div>Aランク: 80%以上</div>
              <div>Bランク: 50%以上</div>
              <div>Cランク: 30%以上</div>
              <div>Dランク: 10%以上</div>
              <div>Eランク: 敗北</div>
            </div>
          </div>
          <button
            onClick={resetGame}
            className="w-full transition-all transform hover:scale-105"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <img src="./menyuUI.png" alt="メニューに戻る" style={{ width: '60%', margin: '0 auto', display: 'block' }} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TurnBasedRPG;
