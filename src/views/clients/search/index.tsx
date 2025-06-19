import { Box, Button, FormControl, Grid, TextField } from "@mui/material";
import { useState } from "react";

interface FilterType {
    name: string;
    date: string;
}

interface Props {
    search: (data: FilterType) => void;
}

const SearchComplaint = ({ search }: Props) => {
    const [name, setName] = useState<string>('');
    const [date, setDate] = useState<string>('');

    const handleSearch = () => {
        search({ name, date });
    };

    const handleSearchAll = () => {
        search({ name: '', date: '' });
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={4}>
                <FormControl fullWidth sx={{ mb: 1 }}>
                    <TextField
                        label="Buscar"
                        placeholder="Buscar dato"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={4}>
                <FormControl fullWidth sx={{ mb: 1 }}>
                    <TextField
                        label="Buscar por fecha"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={4}>
                <Button variant="outlined" sx={{ height: 50 }} onClick={handleSearch}>
                    Buscar
                </Button>
                <Button variant="contained" sx={{ ml: 3, height: 48 }} onClick={handleSearchAll}>
                    Todos
                </Button>
            </Grid>
        </Grid>
    );
};

export default SearchComplaint;
