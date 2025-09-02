import React from 'react';
import { Box, Typography, AppBar, Toolbar, Button, Container, Card, CardContent, Grid } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const StudentPage: React.FC = () => {
  const { handleLogout, user } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* ヘッダー */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            APLink - 学生ダッシュボード
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              ようこそ、{user}さん
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
          学生ダッシュボード
        </Typography>
        
        <Grid container spacing={3}>
          {/* 企業検索カード */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  企業を探す
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  あなたに合った企業を見つけましょう
                </Typography>
                <Button variant="contained" color="primary" fullWidth>
                  企業検索
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* 応募履歴カード */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  応募履歴
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  応募した企業の状況を確認できます
                </Typography>
                <Button variant="contained" color="secondary" fullWidth>
                  履歴を見る
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* プロフィール管理カード */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  プロフィール管理
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  あなたの情報を更新しましょう
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
                  企業からのメッセージを確認
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

export default StudentPage;
