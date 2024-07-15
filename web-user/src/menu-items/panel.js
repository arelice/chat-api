import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Tooltip } from '@mui/material';
import { showSuccess, showError } from 'utils/common';

// assets
import {
  IconDashboard,
  IconSitemap,
  IconArticle,
  IconCoin,
  IconAdjustments,
  IconKey,
  IconGardenCart,
  IconUser,
  IconUserScan,
  IconInfoCircle,
  IconBrandGoogleAnalytics
} from '@tabler/icons-react';

// constant
const icons = { IconDashboard, IconSitemap, IconArticle, IconCoin, IconAdjustments, IconKey, IconGardenCart, IconUser, IconUserScan, IconInfoCircle, IconBrandGoogleAnalytics };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const panel = {
  id: '/',
  type: 'group',
  children: [
    //{
    //  id: 'dashboard',
    //  title: '数据总览',
    //  type: 'item',
    //  url: '/dashboard',
    //  icon: icons.IconDashboard,
    //  breadcrumbs: false,
    //  isAdmin: false
    //},
    {
      id: 'token',
      title: '开始对话/令牌',
      type: 'item',
      url: '/token',
      icon: icons.IconKey,
      breadcrumbs: false
    },
    {
      id: 'topup',
      title: '充值/余额',
      type: 'item',
      url: '/topup',
      icon: icons.IconGardenCart,
      breadcrumbs: false
    },
    //{
    //  id: 'mjlog',
    //  title: 'MJ绘画',
    //  type: 'item',
    //  url: '/mjlog',
    //  icon: icons.IconArticle,
    //  breadcrumbs: false
    //},
    {
      id: 'log',
      title: '消费日志',
      type: 'item',
      url: '/log',
      icon: icons.IconBrandGoogleAnalytics,
      breadcrumbs: false
    },
    {
      id: 'about',
      title: 'API接口文档',
      type: 'item',
      url: '/about',
      icon: icons.IconInfoCircle,
      breadcrumbs: false
    },
    // {
    //  id: 'profile',
    //  title: '个人设置',
    //  type: 'item',
    //  url: '/profile',
    //  icon: icons.IconUserScan,
    //  breadcrumbs: false,
    // }
    // 添加聊天按钮的功能
    {
      id: 'chat',
      title: '聊天',
      type: 'item',
      url: '/chat',
      icon: icons.IconUser, // 选择一个合适的图标
      breadcrumbs: false,
      onClick: handleChatClick // 添加点击事件处理函数
    }
  ]
};

// 定义或导入 COPY_OPTIONS
const COPY_OPTIONS = [
  {
    key: 'next',
    text: 'ChatGPT Next',
    url: '',
    encode: false
  },
  { key: 'next-mj', text: 'ChatGPT-Midjourney', url: '', encode: true },
  { key: 'ama', text: 'BotGem', url: 'ama://set-api-key?server={serverAddress}&key=sk-{key}', encode: true },
  { key: 'opencat', text: 'OpenCat', url: 'opencat://team/join?domain={serverAddress}&token=sk-{key}', encode: true }
];

function replacePlaceholders(text, key, serverAddress) {
  return text.replace('{key}', key).replace('{serverAddress}', serverAddress);
}

const NewComponent = () => {
  const siteInfo = useSelector((state) => state.siteInfo);

  // 聊天按钮的点击事件处理函数
  const handleChatClick = () => {
    if (!siteInfo?.chat_link) {
      showSuccess('管理员未设置聊天界面');
    } else {
      const chatOption = COPY_OPTIONS.find(option => option.key === 'next');
      if (chatOption) {
        handleCopy(chatOption, 'link');
      }
    }
  };

  // 复制处理函数
  const handleCopy = (option, type) => {
    let serverAddress = '';
    if (siteInfo?.server_address) {
      serverAddress = siteInfo.server_address;
    } else {
      serverAddress = window.location.host;
    }

    if (option.encode) {
      serverAddress = encodeURIComponent(serverAddress);
    }

    let url = option.url;

    if (!siteInfo?.chat_link && (option.key === 'next' || option.key === 'next-mj')) {
      showSuccess('管理员未设置聊天界面');
      return;
    }
    if (option.encode) {
      serverAddress = encodeURIComponent(serverAddress);
    }

    if (option.key === 'next' || option.key === 'next-mj') {
      url = siteInfo.chat_link + `/#/?settings={"key":"sk-{key}","url":"{serverAddress}"}`;
    }

    const key = 'your-token-key'; // 替换为实际的 token key
    const text = replacePlaceholders(url, key, serverAddress);
    if (type === 'link') {
      window.open(text);
    } else {
      navigator.clipboard.writeText(text);
      showSuccess('已复制到剪贴板！');
    }
  };

  return (
    <div>
      <Tooltip title="聊天" placement="top">
        <Button color="primary" onClick={handleChatClick}>聊天</Button>
      </Tooltip>
    </div>
  );
};

export default panel;
