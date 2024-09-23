import React from 'react'
import { Modal, Box, Typography, Card, CardContent } from "@mui/material"

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: 500,
  width: "90%",
  bgcolor: "#1a1a1a", // Dark background
  // color: '#e0e0e0',   // Light text
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
}

const QuickModal = ({data, open, handleClose}) => {
  if (!data) return null

  return (
    <Modal
      open={open}
      onClose={handleClose}
    >
      <Box sx={style}>
        <Card sx={{ bgcolor: "transparent", boxShadow: "none" }}>
          <CardContent>
            <Typography variant="h4" component="h2">
              {typeof data === "string" ? data : Object.keys(data)[0]}
            </Typography>

            <Typography sx={{ mt: 2 }}>
              {typeof data === "string" ? (
                <div className="text-white">{data}</div>
              ) : (
                <pre style={{ margin: 0 }} className="text-white">
                  {JSON.stringify(data, null, 2)}
                </pre>
              )}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Modal>
  )
}

export default QuickModal

