await Forecast.create({
  userId: req.user.id,
  profile,
  recommendations: parsed
});
