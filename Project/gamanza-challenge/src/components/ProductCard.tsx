import {
  Card, CardContent, CardMedia, Typography, CardActions, Button,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import type { Product } from '../api/types';

type Props = { product: Product };

export default function ProductCard({ product }: Props) {
  const { search } = useLocation(); // keep current querystring

  // Simple currency format
  const price = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })
    .format(product.price ?? 0);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      {product.thumbnail && (
        <CardMedia
          component="img"
          height="180"
          image={product.thumbnail}
          alt={product.title}
        />
      )}

      {/* Content */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="subtitle1" noWrap>
          {product.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {price}
        </Typography>
      </CardContent>

      {/* Actions */}
      <CardActions>
        {/* View: preserve filters and pass product via state */}
        <Button
          size="small"
          component={RouterLink}
          to={{ pathname: `/products/${product.id}`, search }}
          state={{ product }}
        >
          View
        </Button>

        {/* Edit: same idea to avoid stale refetch */}
        <Button
          size="small"
          component={RouterLink}
          to={{ pathname: `/products/${product.id}/edit`, search }}
          state={{ product }}
        >
          Edit
        </Button>
      </CardActions>
    </Card>
  );
}

