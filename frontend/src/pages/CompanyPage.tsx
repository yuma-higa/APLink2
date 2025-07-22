import React from 'react';
import { Box, Typography, AppBar, Toolbar, Button, Container, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout, decodeToken } from '../utils/auth';

const CompanyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 現在のユーザー情報を取得
  const getCurrentUser = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return decodeToken(token);
    }
    return null;
  };

  const user = getCurrentUser();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* ヘッダー */}
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            APLink - 企業ダッシュボード
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              ようこそ、{user.name}さん
            </Typography>
          )}
          <Button color="inherit" onClick={handleLogout}>
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          企業ダッシュボード
        </Typography>
        
        <Grid container spacing={3}>
          {/* 求人管理カード */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  求人管理
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  求人情報を作成・編集・管理できます
                </Typography>
                <Button variant="contained" color="primary" fullWidth>
                  求人を管理
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* 応募者管理カード */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  応募者管理
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  応募者の情報を確認・管理できます
                </Typography>
                <Button variant="contained" color="secondary" fullWidth>
                  応募者を見る
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* 企業プロフィール管理カード */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  企業プロフィール
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  企業情報を更新・管理できます
                </Typography>
                <Button variant="outlined" fullWidth>
                  プロフィール編集
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* メッセージカード */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  メッセージ
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  学生とのメッセージを管理
                </Typography>
                <Button variant="outlined" fullWidth>
                  メッセージ確認
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CompanyPage;
