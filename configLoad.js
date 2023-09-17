const fs = require('fs');
const yaml = require('js-yaml');

// 默认配置（可以在需要时覆盖）
let config = {};

// 加载配置文件
try {
  const configFile = fs.readFileSync('config.yaml', 'utf8');
  config = yaml.load(configFile,{ schema: yaml.JSON_SCHEMA });
} catch (error) {
  console.error('加载配置文件时出错:', error);
}

// 导出配置对象
module.exports = config;
