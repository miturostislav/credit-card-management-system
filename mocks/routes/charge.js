module.exports = [
  {
    id: 'charge',
    url: '/api/v1/charge',
    method: 'POST',
    variants: [
      {
        id: '1',
        type: 'middleware',
        options: {
          middleware: (req, res, next) => {
            if ((Math.ceil(Math.random() * 10) % 4) !== 0) {
              res.status(200);
              res.send();
            } else {
              next();
            }
          },
        },
      },
      {
        id: '2',
        type: 'middleware',
        options: {
          middleware: (req, res, next) => {
            if (Math.ceil(Math.random() * 10) % 2) {
              res.status(500);
              res.send({ message: 'Error' });
            } else {
              next();
            }
          },
        },
      },
      {
        id: '3',
        type: 'json',
        options: {
          status: 400,
          body: { message: 'Error' },
        },
      },
    ],
  },
];