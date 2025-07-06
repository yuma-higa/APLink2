import React from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

type InfoCardProps = {
  children: React.ReactNode;
  onClick?: () => void;
  sx?: object;
};

export default function InfoCard({ children, onClick, sx = {} }: InfoCardProps) {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius:
          typeof theme.shape.borderRadius === "number"
            ? theme.shape.borderRadius * 2
            : `calc(${theme.shape.borderRadius} * 2)`,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent:"center",
        p: { xs: 3, sm: 4 },
        minWidth: { xs: '90%', sm: 400 },
        maxWidth: { xs: '98%', sm: 420 },
        width: "100%",
        gap: 2,
        ...sx
      }}
    >
      {children}
    </Box>
  );
}